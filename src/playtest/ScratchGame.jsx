import { useEffect, useRef, useState } from 'react';
import { GameFrame, PrizeResult } from './GameFrame';
import GoldCat from './GoldCat';
import { PRIZE } from './prize';

function paintCoat(ctx, width, height) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#3a3200';
    ctx.lineWidth = Math.max(2, width / 80);
    for (let x = -height; x < width; x += width / 12) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
    }
    ctx.fillStyle = '#ffd400';
    ctx.font = `700 ${Math.round(width / 14)}px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH', width / 2, height / 2);
}

function ScratchCard({ onDone }) {
    const canvasRef = useRef(null);
    const lastRef = useRef(null);
    const lastCheckRef = useRef(0);
    const drawingRef = useRef(false);
    const doneRef = useRef(false);
    const [prize] = useState(PRIZE);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        let frame = 0;
        let tries = 0;
        const paint = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width < 2 || rect.height < 2) {
                tries += 1;
                if (tries < 20) frame = requestAnimationFrame(paint);
                return;
            }
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(rect.width * dpr);
            canvas.height = Math.round(rect.height * dpr);
            paintCoat(canvas.getContext('2d'), canvas.width, canvas.height);
        };
        paint();
        return () => cancelAnimationFrame(frame);
    }, []);

    function scratch(event) {
        if (doneRef.current || !drawingRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = canvas.width * 0.08;
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.beginPath();
        if (lastRef.current) ctx.moveTo(lastRef.current.x, lastRef.current.y);
        else ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        lastRef.current = { x, y };

        const now = performance.now();
        if (now - lastCheckRef.current < 90) return;
        lastCheckRef.current = now;

        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let clear = 0;
        let samples = 0;
        for (let i = 3; i < pixels.length; i += 64) {
            samples += 1;
            if (pixels[i] < 30) clear += 1;
        }
        if (samples > 0 && clear / samples > 0.42) {
            doneRef.current = true;
            setRevealed(true);
            onDone(prize);
        }
    }

    return (
        <div className="pt-scratch">
            <div className={`pt-scratch-prize ${revealed ? 'show' : ''}`}>
                <GoldCat />
                <p className="pt-kicker">Under the tag</p>
                <strong>20% off</strong>
            </div>
            <canvas
                ref={canvasRef}
                className={`pt-scratch-coat ${revealed ? 'gone' : ''}`}
                onPointerDown={(event) => {
                    try {
                        event.currentTarget.setPointerCapture(event.pointerId);
                    } catch {
                        // Scratching still tracks the drag if capture is unavailable.
                    }
                    drawingRef.current = true;
                    lastRef.current = null;
                    scratch(event);
                }}
                onPointerMove={scratch}
                onPointerUp={() => {
                    drawingRef.current = false;
                    lastRef.current = null;
                }}
                onPointerCancel={() => {
                    drawingRef.current = false;
                    lastRef.current = null;
                }}
            />
        </div>
    );
}

export default function ScratchGame() {
    const [round, setRound] = useState(0);
    const [prize, setPrize] = useState(undefined);

    return (
        <GameFrame
            title="Scratch the Tag"
            note="Scratch the tag until the black cat shows. That cat is 20% off."
        >
            <ScratchCard key={round} onDone={setPrize} />
            {prize ? (
                <PrizeResult
                    prize={prize}
                    detail="You uncovered the black cat. 20% off, available for a limited time."
                    onAgain={() => {
                        setPrize(undefined);
                        setRound((value) => value + 1);
                    }}
                    againLabel="New tag"
                />
            ) : (
                <p className="pt-meta">Drag across the tag.</p>
            )}
        </GameFrame>
    );
}
