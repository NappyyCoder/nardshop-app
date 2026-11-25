import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GameFrame, PrizeResult } from './GameFrame';
import GoldCat from './GoldCat';
import { PRIZE } from './prize';

const GOAL = 5;

function prizeForStack(dropped, width) {
    if (dropped >= GOAL && width >= 24) return PRIZE;
    return null;
}

export default function StackGame() {
    const moverRef = useRef({ x: 8, width: 42, dir: 1 });
    const moverEl = useRef(null);
    const placedRef = useRef([{ x: 29, width: 42 }]);
    const doneRef = useRef(false);
    const placeRef = useRef(() => {});
    const lastPlaceRef = useRef(0);
    const [mover, setMover] = useState(moverRef.current);
    const [placed, setPlaced] = useState(placedRef.current);
    const [perfect, setPerfect] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (result) return undefined;
        let frame = 0;
        let last = performance.now();
        let alive = true;

        const loop = (now) => {
            if (!alive) return;
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const current = moverRef.current;
            let x = current.x + current.dir * 52 * dt;
            let dir = current.dir;
            const maxX = 100 - current.width;
            if (x >= maxX) {
                x = maxX;
                dir = -1;
            } else if (x <= 0) {
                x = 0;
                dir = 1;
            }
            moverRef.current = { ...current, x, dir };
            if (moverEl.current) moverEl.current.style.left = `${x}%`;
            frame = requestAnimationFrame(loop);
        };

        frame = requestAnimationFrame(loop);
        return () => {
            alive = false;
            cancelAnimationFrame(frame);
        };
    }, [result]);

    function finish(dropped, width) {
        doneRef.current = true;
        const prize = prizeForStack(dropped, width);
        setResult({
            prize,
            detail: prize
                ? 'The tower reached the black cat. 20% off, available for a limited time.'
                : dropped >= GOAL
                    ? 'The stack reached the cat, then slipped too narrow.'
                    : 'The tower tipped before it reached the black cat.',
        });
    }

    function place() {
        if (doneRef.current) return;
        const now = performance.now();
        if (now - lastPlaceRef.current < 180) return;
        lastPlaceRef.current = now;
        const previous = placedRef.current[placedRef.current.length - 1];
        const moving = moverRef.current;
        const left = Math.max(previous.x, moving.x);
        const right = Math.min(previous.x + previous.width, moving.x + moving.width);
        const overlap = right - left;
        const dropped = placedRef.current.length;

        if (overlap < 9) {
            finish(dropped - 1, 0);
            return;
        }

        const clean = previous.width - overlap < 4.5;
        const nextBlock = clean
            ? { x: previous.x, width: previous.width }
            : { x: left, width: overlap };
        const nextPlaced = [...placedRef.current, nextBlock];
        placedRef.current = nextPlaced;
        setPlaced(nextPlaced);
        setPerfect(clean);
        moverRef.current = { x: 0, width: nextBlock.width, dir: 1 };
        if (moverEl.current) {
            moverEl.current.style.left = '0%';
            moverEl.current.style.width = `${nextBlock.width}%`;
        }
        setMover(moverRef.current);

        if (nextPlaced.length - 1 >= GOAL) {
            finish(GOAL, nextBlock.width);
        }
    }

    placeRef.current = place;

    useEffect(() => {
        const onKey = (event) => {
            if (event.repeat || event.key !== ' ') return;
            event.preventDefault();
            placeRef.current();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    function reset() {
        const base = [{ x: 29, width: 42 }];
        placedRef.current = base;
        moverRef.current = { x: 8, width: 42, dir: 1 };
        doneRef.current = false;
        setPlaced(base);
        setMover(moverRef.current);
        setPerfect(false);
        setResult(null);
    }

    useLayoutEffect(() => {
        const node = moverEl.current;
        if (!node) return;
        node.style.left = `${moverRef.current.x}%`;
        node.style.width = `${moverRef.current.width}%`;
    });

    const dropped = Math.max(0, placed.length - 1);

    return (
        <GameFrame
            title="Stack the Drop"
            note="Stack up to the black cat. Keep each block wide. Land all 5 under the cat for 20% off."
        >
            <div className="pt-hud">
                <span>Stacked {Math.min(dropped, GOAL)} / {GOAL}</span>
                <span>{perfect ? 'Perfect' : 'Tap to drop'}</span>
            </div>
            <div className="pt-stack" onPointerDown={result ? undefined : place}>
                <div className="pt-stack-prize">
                    <GoldCat />
                </div>
                {placed.map((block, index) => (
                    <div
                        key={`${block.x}-${index}`}
                        className="pt-block"
                        style={{
                            left: `${block.x}%`,
                            width: `${block.width}%`,
                            bottom: `${16 + index * 52}px`,
                        }}
                    />
                ))}
                {!result && (
                    <div
                        ref={moverEl}
                        className="pt-block moving"
                        style={{
                            width: `${mover.width}%`,
                            bottom: `${16 + placed.length * 52}px`,
                        }}
                    />
                )}
            </div>
            {result ? (
                <PrizeResult prize={result.prize} detail={result.detail} onAgain={reset} />
            ) : (
                <button type="button" className="pt-btn pt-btn-block" onClick={place}>
                    Drop
                </button>
            )}
        </GameFrame>
    );
}
