import { useEffect, useRef, useState } from 'react';
import face from '../assets/nard-face-yellow.png';
import { GameFrame, PrizeResult } from './GameFrame';
import GoldCat from './GoldCat';
import { PRIZE } from './prize';

function crossesTarget(x1, y1, x2, y2, target, radius) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((target.x - x1) * dx + (target.y - y1) * dy) / length));
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    return Math.hypot(px - target.x, py - target.y) <= radius;
}

function bestPrize(prizes) {
    return prizes.includes(PRIZE) ? PRIZE : null;
}

export default function SlingGame() {
    const courtRef = useRef(null);
    const puckRef = useRef(null);
    const pullRef = useRef(null);
    const flightRef = useRef(null);
    const shotsRef = useRef([]);
    const frameRef = useRef(0);
    const [pull, setPull] = useState(null);
    const [puck, setPuck] = useState(null);
    const [shots, setShots] = useState([]);
    const [finalPrize, setFinalPrize] = useState(undefined);

    useEffect(() => () => {
        flightRef.current = null;
        cancelAnimationFrame(frameRef.current);
    }, []);

    function courtBox() {
        return courtRef.current.getBoundingClientRect();
    }

    function originOf(rect) {
        return { x: rect.width * 0.26, y: rect.height * 0.76 };
    }

    function targetOf(rect) {
        return { x: rect.width * 0.7, y: rect.height * 0.28 };
    }

    function pointInCourt(event) {
        const rect = courtBox();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            rect,
        };
    }

    function applyPull(point) {
        const origin = originOf(point.rect);
        let dx = point.x - origin.x;
        let dy = point.y - origin.y;
        const length = Math.hypot(dx, dy);
        if (length > 120) {
            dx = (dx / length) * 120;
            dy = (dy / length) * 120;
        }
        const next = { x: origin.x + dx, y: origin.y + dy, rect: point.rect };
        pullRef.current = next;
        setPull(next);
        setPuck({ x: next.x, y: next.y });
    }

    function beginPull(event) {
        if (finalPrize !== undefined || flightRef.current) return;
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // Release still launches if capture is unavailable.
        }
        applyPull(pointInCourt(event));
    }

    function movePull(event) {
        if (!pullRef.current || flightRef.current) return;
        applyPull(pointInCourt(event));
    }

    function launch() {
        const held = pullRef.current;
        pullRef.current = null;
        setPull(null);
        if (!held || flightRef.current || finalPrize !== undefined) return;
        const origin = originOf(held.rect);
        const dx = held.x - origin.x;
        const dy = held.y - origin.y;
        if (Math.hypot(dx, dy) < 24) {
            setPuck(null);
            return;
        }

        const rect = courtBox();
        const target = targetOf(rect);
        flightRef.current = {
            x: origin.x + dx,
            y: origin.y + dy,
            vx: -dx * 7.2,
            vy: -dy * 7.2,
            width: rect.width,
            height: rect.height,
            target,
        };

        let last = performance.now();
        const loop = (now) => {
            const flight = flightRef.current;
            if (!flight) return;
            const dt = Math.min(0.032, (now - last) / 1000);
            last = now;
            const previousX = flight.x;
            const previousY = flight.y;
            flight.age = (flight.age || 0) + dt;
            flight.vy += 980 * dt;
            flight.x += flight.vx * dt;
            flight.y += flight.vy * dt;
            if (puckRef.current) {
                puckRef.current.style.left = `${flight.x}px`;
                puckRef.current.style.top = `${flight.y}px`;
            }

            const prize = flight.age > 0.15 && crossesTarget(previousX, previousY, flight.x, flight.y, flight.target, 42)
                ? PRIZE
                : null;

            const offBoard = flight.y > flight.height + 30
                || flight.x < -40
                || flight.x > flight.width + 40
                || flight.y < -120;
            if (prize || offBoard) {
                flightRef.current = null;
                const next = [...shotsRef.current, prize || null];
                shotsRef.current = next;
                setShots(next);
                setPuck(prize ? { x: flight.target.x, y: flight.target.y } : null);
                if (next.length >= 3 || prize === PRIZE) {
                    setFinalPrize(bestPrize(next));
                }
                return;
            }
            frameRef.current = requestAnimationFrame(loop);
        };

        frameRef.current = requestAnimationFrame(loop);
    }

    function reset() {
        cancelAnimationFrame(frameRef.current);
        flightRef.current = null;
        pullRef.current = null;
        shotsRef.current = [];
        setPull(null);
        setPuck(null);
        setShots([]);
        setFinalPrize(undefined);
    }

    const aiming = pull && courtRef.current;
    const origin = aiming ? originOf(courtBox()) : null;

    return (
        <GameFrame
            title="Sling It"
            note="Pull the face back and let go. Hit the black cat for 20% off. You get 3 shots."
        >
            <div className="pt-hud">
                <span>Shot {Math.min(shots.length + 1, 3)} of 3</span>
                <span>{shots.filter(Boolean).length} hits</span>
            </div>
            <div
                ref={courtRef}
                className="pt-sling"
                onPointerDown={beginPull}
                onPointerMove={movePull}
                onPointerUp={launch}
                onPointerCancel={() => {
                    pullRef.current = null;
                    setPull(null);
                    setPuck(null);
                }}
            >
                <div className="pt-ring outer" />
                <div className="pt-ring inner">
                    <GoldCat />
                </div>
                {origin && puck && (
                    <svg className="pt-aim" aria-hidden="true">
                        <line x1={origin.x} y1={origin.y} x2={puck.x} y2={puck.y} />
                    </svg>
                )}
                <img
                    ref={puckRef}
                    src={face}
                    alt=""
                    className="pt-puck"
                    style={puck ? { left: puck.x, top: puck.y } : undefined}
                />
            </div>
            <ul className="pt-shot-list">
                {shots.map((prize, index) => (
                    <li key={`${prize}-${index}`}>Shot {index + 1}: {prize ? 'Black cat' : 'Miss'}</li>
                ))}
            </ul>
            {finalPrize !== undefined && (
                <PrizeResult
                    prize={finalPrize}
                    detail={finalPrize ? 'That shot hit the black cat. 20% off, available for a limited time.' : 'All 3 shots missed the black cat.'}
                    onAgain={reset}
                />
            )}
        </GameFrame>
    );
}
