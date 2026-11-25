import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import face from '../assets/nard-face-yellow.png';
import { GameFrame, PrizeResult } from './GameFrame';
import GoldCat from './GoldCat';
import { PRIZE } from './prize';

const SLOTS = [null, null, null, PRIZE, null, null, null];

function bestPrize(prizes) {
    return prizes.includes(PRIZE) ? PRIZE : null;
}

function buildPath(startX) {
    let x = startX;
    const path = [{ x, y: 18 }];
    for (let row = 0; row < 8; row += 1) {
        const direction = Math.random() < 0.5 ? -1 : 1;
        const pull = (50 - x) * 0.08;
        x = Math.min(94, Math.max(6, x + direction * (8 + Math.random() * 5) + pull));
        path.push({ x, y: 58 + row * 34 });
    }
    path.push({ x, y: 348 });
    return path;
}

function pointOnPath(path, amount) {
    const scaled = amount * (path.length - 1);
    const index = Math.min(path.length - 2, Math.floor(scaled));
    const local = scaled - index;
    const from = path[index];
    const to = path[index + 1];
    return {
        x: from.x + (to.x - from.x) * local,
        y: from.y + (to.y - from.y) * local,
    };
}

function slotIndex(x) {
    return Math.min(6, Math.floor(Math.min(99.9, Math.max(0, x)) / (100 / 7)));
}

function placeChip(node, point) {
    if (!node) return;
    node.style.left = `${point.x}%`;
    node.style.top = `${point.y}px`;
}

export default function PlinkoGame() {
    const chipRef = useRef(null);
    const fallingRef = useRef(false);
    const stopRef = useRef(() => {});
    const [dropX, setDropX] = useState(50);
    const [chip, setChip] = useState({ x: 50, y: 18 });
    const [falling, setFalling] = useState(false);
    const [landed, setLanded] = useState([]);
    const [activeSlot, setActiveSlot] = useState(null);
    const finalPrize = landed.length >= 3 ? bestPrize(landed) : undefined;

    const pegs = useMemo(() => {
        const dots = [];
        for (let row = 0; row < 8; row += 1) {
            const count = row % 2 === 0 ? 6 : 7;
            for (let col = 0; col < count; col += 1) {
                dots.push({
                    id: `${row}-${col}`,
                    x: ((col + 1) / (count + 1)) * 100,
                    y: 58 + row * 34,
                });
            }
        }
        return dots;
    }, []);

    useEffect(() => () => stopRef.current(), []);

    useLayoutEffect(() => {
        placeChip(chipRef.current, chip);
    }, [chip]);

    function moveDropper(event) {
        if (fallingRef.current || landed.length >= 3) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const next = ((event.clientX - rect.left) / rect.width) * 100;
        const x = Math.min(88, Math.max(12, next));
        setDropX(x);
        setChip({ x, y: 18 });
        placeChip(chipRef.current, { x, y: 18 });
    }

    function drop() {
        if (fallingRef.current || landed.length >= 3) return;
        const path = buildPath(dropX);
        fallingRef.current = true;
        setFalling(true);
        setActiveSlot(null);
        const started = performance.now();
        let alive = true;

        const loop = (now) => {
            if (!alive) return;
            const amount = Math.min(1, (now - started) / 1500);
            const eased = 1 - ((1 - amount) ** 2);
            const point = pointOnPath(path, eased);
            placeChip(chipRef.current, point);
            if (amount < 1) {
                frame = requestAnimationFrame(loop);
                return;
            }
            fallingRef.current = false;
            const slot = slotIndex(point.x);
            setChip(point);
            setActiveSlot(slot);
            setLanded((current) => (current.length >= 3 ? current : [...current, SLOTS[slot]]));
            setFalling(false);
        };

        let frame = 0;
        stopRef.current = () => {
            alive = false;
            cancelAnimationFrame(frame);
        };
        frame = requestAnimationFrame(loop);
    }

    function reset() {
        stopRef.current();
        fallingRef.current = false;
        setDropX(50);
        setChip({ x: 50, y: 18 });
        setFalling(false);
        setLanded([]);
        setActiveSlot(null);
    }

    return (
        <GameFrame
            title="Plinko"
            note="Slide the chip, then drop it. You get 3 drops. Land on the black cat for 20% off."
        >
            <div className="pt-plinko">
                {pegs.map((peg) => (
                    <span
                        key={peg.id}
                        className="pt-peg"
                        style={{ left: `${peg.x}%`, top: `${peg.y}px` }}
                    />
                ))}
                <img
                    ref={chipRef}
                    src={face}
                    alt=""
                    className="pt-chip"
                />
                <div className="pt-slots">
                    {SLOTS.map((slot, index) => (
                        <span
                            key={index}
                            className={`pt-slot ${slot ? 'gold' : ''} ${activeSlot === index ? 'hit' : ''}`}
                        >
                            {slot ? <GoldCat /> : 'Miss'}
                        </span>
                    ))}
                </div>
            </div>
            <div
                className="pt-dropper"
                onPointerDown={(event) => {
                    try {
                        event.currentTarget.setPointerCapture(event.pointerId);
                    } catch {
                        // Sliding still follows the pointer.
                    }
                    moveDropper(event);
                }}
                onPointerMove={(event) => {
                    if (event.buttons === 0 && event.pointerType === 'mouse') return;
                    moveDropper(event);
                }}
            >
                <span className="pt-dropper-knob" style={{ left: `${dropX}%` }} />
            </div>
            <p className="pt-meta">
                {landed.length === 0 && 'No drops yet.'}
                {landed.map((prize, index) => `Drop ${index + 1}: ${prize ? 'Black cat' : 'Miss'}`).join('  ·  ')}
            </p>
            {finalPrize === undefined ? (
                <button type="button" className="pt-btn pt-btn-block" onClick={drop} disabled={falling}>
                    {falling ? 'Dropping' : `Drop ${landed.length + 1} of 3`}
                </button>
            ) : (
                <PrizeResult
                    prize={finalPrize}
                    detail={finalPrize ? 'The chip found the black cat. 20% off, available for a limited time.' : 'The black cat was the center pocket.'}
                    onAgain={reset}
                />
            )}
        </GameFrame>
    );
}
