import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createCatCube } from './catCube';
import { createTiltMemory, subscribeDeviceTilt, subscribeTiltReset, subscribeTiltUnlock, tiltOffset } from '../hooks/deviceTilt';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const damp = (current, target, lambda, dt) => (
    current + (target - current) * (1 - Math.exp(-lambda * dt))
);

const isPhone = () => window.matchMedia('(pointer: coarse), (max-width: 800px)').matches;

export const TvCube = ({
    skin = 'yellow',
    logo,
    canTune = true,
    className = 'drop-cube',
}) => {
    const sceneRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const host = sceneRef.current;
        const canvas = canvasRef.current;
        if (!host || !canvas) return undefined;

        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const phone = isPhone();
        const social = className.includes('social');
        const state = {
            aimX: 0,
            aimY: 0,
            rotX: 0,
            rotY: 0,
            dragging: false,
            lastX: 0,
            lastY: 0,
            travel: 0,
            touchTunedAt: 0,
            guided: false,
            pointer: false,
            tilt: false,
            memory: createTiltMemory(),
            reduce: motion.matches,
            visible: true,
            dead: false,
        };
        const onMotion = () => {
            state.reduce = motion.matches;
        };
        motion.addEventListener('change', onMotion);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: !phone,
            powerPreference: phone ? 'default' : 'high-performance',
            stencil: false,
            depth: true,
        });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 40);
        camera.position.set(0, 0.22, 2.8);
        camera.lookAt(0, 0.2, 0);

        let cube = null;
        let pendingTune = null;
        let lastIdle = 0;

        const applyTune = (id) => {
            if (cube) cube.tune(id);
            else pendingTune = id;
        };

        const onTune = (event) => {
            if (canTune) applyTune(event.detail);
        };

        const fit = () => {
            const cap = social ? (phone ? 1.75 : 2) : (phone ? 2 : 2.5);
            const ratio = Math.min(window.devicePixelRatio || 1, cap);
            const width = Math.max(1, host.clientWidth);
            const height = Math.max(1, host.clientHeight);
            renderer.setPixelRatio(ratio);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        fit();

        const faceForward = () => {
            state.memory = createTiltMemory();
            state.tilt = false;
            state.pointer = false;
            state.guided = false;
            state.aimX = 0;
            state.aimY = 0;
        };

        const aimAt = (clientX, clientY) => {
            const box = host.getBoundingClientRect();
            const nx = clamp((clientX - (box.left + box.width / 2)) / (window.innerWidth * 0.42), -1, 1);
            const ny = clamp((clientY - (box.top + box.height / 2)) / (window.innerHeight * 0.42), -1, 1);
            state.guided = true;
            state.aimY = nx * 0.7;
            state.aimX = ny * 0.36;
        };

        const follow = (event) => {
            if (event.pointerType === 'touch' || event.pointerType === 'pen') return;
            if (state.dragging) return;
            state.pointer = true;
            state.tilt = false;
            aimAt(event.clientX, event.clientY);
        };

        const leaveWindow = () => {
            if (state.dragging) return;
            state.pointer = false;
            if (!state.tilt) state.guided = false;
        };

        const pointerNdc = new THREE.Vector2();

        const tuneFromPointer = (event) => {
            if (!canTune || state.reduce || !cube) return;
            const box = host.getBoundingClientRect();
            pointerNdc.x = ((event.clientX - box.left) / box.width) * 2 - 1;
            pointerNdc.y = -((event.clientY - box.top) / box.height) * 2 + 1;
            const hit = cube.pickDial?.(pointerNdc, camera);
            if (hit?.action === 'tune') cube.tune(hit.id);
            else cube.zap();
        };

        const onPose = (next) => {
            if (!phone || state.dragging || state.pointer) return;
            const delta = tiltOffset(next.beta, next.gamma, state.memory);
            if (!delta || (delta.x === 0 && delta.y === 0)) {
                state.tilt = false;
                if (!state.pointer && !state.dragging) state.guided = false;
                return;
            }
            state.tilt = true;
            state.guided = true;
            state.aimY = clamp(delta.y / 18, -1.15, 1.15);
            state.aimX = clamp(delta.x / 22, -0.7, 0.7);
        };

        const onDown = (event) => {
            if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
            if (canTune) event.preventDefault();
            host.setPointerCapture(event.pointerId);
            state.dragging = true;
            state.guided = true;
            state.travel = 0;
            state.lastX = event.clientX;
            state.lastY = event.clientY;
            host.classList.add('is-dragging');
        };

        const onMove = (event) => {
            if (!state.dragging) return;
            const dx = event.clientX - state.lastX;
            const dy = event.clientY - state.lastY;
            state.lastX = event.clientX;
            state.lastY = event.clientY;
            state.travel += Math.abs(dx) + Math.abs(dy);
            state.aimY = clamp(state.aimY + dx * 0.008, -1.15, 1.15);
            state.aimX = clamp(state.aimX + dy * 0.008, -0.7, 0.7);
        };

        const onUp = (event) => {
            const tapped = state.dragging && state.travel < 14;
            state.dragging = false;
            if (!state.tilt) state.guided = false;
            host.classList.remove('is-dragging');
            if (host.hasPointerCapture?.(event.pointerId)) {
                host.releasePointerCapture(event.pointerId);
            }
            if (tapped) {
                tuneFromPointer(event);
                state.touchTunedAt = performance.now();
            }
        };

        const onClick = (event) => {
            if (!canTune) return;
            if (performance.now() - state.touchTunedAt < 700) return;
            if (event.pointerType === 'touch' || event.pointerType === 'pen') return;
            tuneFromPointer(event);
        };

        const clock = new THREE.Clock();
        const tick = () => {
            if (!state.visible || state.dead) return;
            const now = performance.now();
            const busy = state.guided || state.dragging || state.tilt;
            if (social && !busy && now - lastIdle < 33) return;
            lastIdle = now;

            const dt = Math.min(clock.getDelta(), 0.032);
            if (!busy) {
                state.aimX = 0;
                state.aimY = 0;
            }
            const lambda = 22;
            state.rotX = damp(state.rotX, state.aimX, lambda, dt);
            state.rotY = damp(state.rotY, state.aimY, lambda, dt);
            if (cube) {
                cube.group.rotation.x = state.rotX;
                cube.group.rotation.y = state.rotY;
                if (!state.reduce) cube.refreshScreen();
            }
            renderer.render(scene, camera);
        };

        const play = () => {
            if (state.dead || !state.visible) return;
            renderer.setAnimationLoop(tick);
        };

        const pause = () => {
            renderer.setAnimationLoop(null);
        };

        createCatCube(skin, { logo, lite: social }).then((built) => {
            if (state.dead) {
                built.dispose();
                return;
            }
            cube = built;
            scene.add(cube.group);
            if (pendingTune) {
                cube.tune(pendingTune);
                pendingTune = null;
            }
            if (state.visible) play();
        }).catch(() => {});

        const resize = new ResizeObserver(fit);
        resize.observe(host);
        const see = new IntersectionObserver(([entry]) => {
            state.visible = entry.isIntersecting && entry.intersectionRatio > 0.02;
            if (state.visible) play();
            else pause();
        }, { rootMargin: '60px', threshold: 0.02 });
        see.observe(host);

        const stopTilt = subscribeDeviceTilt(onPose);
        const stopUnlock = subscribeTiltUnlock(faceForward);
        const stopReset = subscribeTiltReset(faceForward);
        if (!phone) {
            window.addEventListener('pointermove', follow, { passive: true });
            window.addEventListener('pointerleave', leaveWindow);
            document.addEventListener('mouseleave', leaveWindow);
        }
        host.addEventListener('pointerdown', onDown, { passive: false });
        host.addEventListener('pointermove', onMove);
        host.addEventListener('pointerup', onUp);
        host.addEventListener('pointercancel', onUp);
        host.addEventListener('click', onClick);
        window.addEventListener('nard-tv-channel', onTune);

        return () => {
            state.dead = true;
            pause();
            resize.disconnect();
            see.disconnect();
            stopTilt();
            stopUnlock();
            stopReset();
            motion.removeEventListener('change', onMotion);
            window.removeEventListener('pointermove', follow);
            window.removeEventListener('pointerleave', leaveWindow);
            document.removeEventListener('mouseleave', leaveWindow);
            host.removeEventListener('pointerdown', onDown);
            host.removeEventListener('pointermove', onMove);
            host.removeEventListener('pointerup', onUp);
            host.removeEventListener('pointercancel', onUp);
            host.removeEventListener('click', onClick);
            window.removeEventListener('nard-tv-channel', onTune);
            cube?.dispose();
            renderer.dispose();
        };
    }, [canTune, className, logo, skin]);

    return (
        <div className={className} aria-hidden="true">
            <div ref={sceneRef} className="drop-cube-scene">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};

const DropCube = () => <TvCube />;

export default DropCube;
