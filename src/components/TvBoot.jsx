import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import catLogo from '../assets/nard-cat-yellow.png';
import '../styles/tv-boot.css';

const ease = [0.2, 0.9, 0.2, 1];

const TvBoot = ({ onDone }) => {
    const canvasRef = useRef(null);
    const stageRef = useRef('line');
    const doneRef = useRef(false);
    const timersRef = useRef([]);
    const [stage, setStage] = useState('line');

    const go = (next) => {
        stageRef.current = next;
        setStage(next);
    };

    const finish = (fromUser = false) => {
        if (doneRef.current) return;
        doneRef.current = true;
        timersRef.current.forEach(clearTimeout);
        go('off');
        timersRef.current = [setTimeout(onDone, 420)];
    };

    useEffect(() => {
        const at = (ms, fn) => timersRef.current.push(setTimeout(fn, ms));
        at(420, () => go('open'));
        at(900, () => go('signal'));
        at(1600, () => finish(false));

        const skip = (event) => {
            if (event.key === 'Enter' || event.key === ' ') finish(true);
        };
        window.addEventListener('keydown', skip);
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';

        return () => {
            timersRef.current.forEach(clearTimeout);
            window.removeEventListener('keydown', skip);
            document.body.style.overflow = overflow;
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return undefined;

        const phone = window.matchMedia('(pointer: coarse), (max-width: 800px)').matches;
        canvas.width = phone ? 96 : Math.max(160, Math.floor(window.innerWidth / 4));
        canvas.height = phone ? 72 : Math.max(120, Math.floor(window.innerHeight / 4));

        let id;
        let frame = 0;
        const draw = () => {
            frame += 1;
            if (!phone || frame % 3 === 0) {
                const { width, height } = canvas;
                const image = ctx.createImageData(width, height);
                const { data } = image;
                const loud = stageRef.current === 'open' ? 1 : 0.7;
                const base = 30 * loud;
                const range = 225 * loud;
                for (let i = 0; i < data.length; i += 4) {
                    const value = base + Math.random() * range;
                    data[i] = value;
                    data[i + 1] = value * 0.97;
                    data[i + 2] = value * 0.86;
                    data[i + 3] = 255;
                }
                ctx.putImageData(image, 0, 0);
            }
            id = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <motion.div
            className="tv-boot"
            initial={{ opacity: 1 }}
            animate={{ opacity: stage === 'off' ? 0 : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            <motion.div
                className="tv-boot-screen"
                initial={{ scaleX: 0.004, scaleY: 0.004 }}
                animate={
                    stage === 'line'
                        ? { scaleX: 1, scaleY: 0.004 }
                        : { scaleX: 1, scaleY: 1 }
                }
                transition={
                    stage === 'line'
                        ? { duration: 0.38, ease }
                        : { duration: 0.32, ease }
                }
            >
                <canvas ref={canvasRef} className="tv-boot-static" aria-hidden="true" />
                <div className="tv-boot-roll" aria-hidden="true" />
                <div className="tv-boot-scan" aria-hidden="true" />
                <motion.div
                    className="tv-boot-flash"
                    aria-hidden="true"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: stage === 'line' ? 1 : 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                />
                {(stage === 'signal' || stage === 'off') && (
                    <div className="tv-boot-signal">
                        <img src={catLogo} alt="" className="tv-boot-cat" />
                    </div>
                )}
            </motion.div>
            <button type="button" className="tv-boot-hit" aria-label="Continue" onClick={() => finish(true)} />
        </motion.div>
    );
};

export default TvBoot;
