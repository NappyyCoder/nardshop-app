import { useEffect, useRef, useState } from 'react';

function paintCoat(ctx, width, height) {
    const foil = ctx.createLinearGradient(0, 0, width, height);
    foil.addColorStop(0, '#c8c8c8');
    foil.addColorStop(0.42, '#f7f7f7');
    foil.addColorStop(0.58, '#8d8d8d');
    foil.addColorStop(1, '#e4e4e4');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.lineWidth = Math.max(2, width / 90);
    for (let x = -height; x < width; x += width / 14) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
    }

    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `400 ${Math.round(width / 9)}px "Jockey One", sans-serif`;
    ctx.fillText('SCRATCH', width / 2, height * 0.46);
    ctx.font = `400 ${Math.round(width / 16)}px "Jockey One", sans-serif`;
    ctx.fillText('YOUR CODE', width / 2, height * 0.64);
}

export default function ScratchTicket({ prize, code, onClose, onCopy, copied }) {
    const canvasRef = useRef(null);
    const dialogRef = useRef(null);
    const lastRef = useRef(null);
    const lastCheckRef = useRef(0);
    const drawingRef = useRef(false);
    const doneRef = useRef(false);
    const [revealed, setRevealed] = useState(false);
    const revealText = code || prize;

    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialogRef.current?.focus();
        return () => {
            document.body.style.overflow = previous;
        };
    }, []);

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

    function finish() {
        if (doneRef.current) return;
        doneRef.current = true;
        setRevealed(true);
    }

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
        ctx.lineWidth = canvas.width * 0.09;
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
        if (samples > 0 && clear / samples > 0.42) finish();
    }

    return (
        <div className="pt-ticket-pop">
            <div
                ref={dialogRef}
                className="pt-ticket"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pt-ticket-title"
                tabIndex={-1}
                onKeyDown={(event) => {
                    if (event.key === 'Escape' && revealed) onClose();
                }}
            >
                <p className="pt-ticket-kicker">Ticket</p>
                <h2 id="pt-ticket-title">{prize}</h2>
                <p className="pt-ticket-note">
                    {revealed
                        ? (code ? 'That code is yours. Use it at checkout.' : 'That prize is yours.')
                        : 'Scratch the silver like a lottery ticket.'}
                </p>
                <div className="pt-ticket-card">
                    <div className={`pt-ticket-prize ${revealed ? 'show' : ''}`} aria-hidden={!revealed}>
                        <span>{code ? 'Your code' : 'You won'}</span>
                        <strong>{revealText}</strong>
                    </div>
                    <canvas
                        ref={canvasRef}
                        className={`pt-ticket-coat ${revealed ? 'gone' : ''}`}
                        aria-hidden="true"
                        onPointerDown={(event) => {
                            try {
                                event.currentTarget.setPointerCapture(event.pointerId);
                            } catch {
                                // The drag still tracks if the browser refuses capture.
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
                <div className="pt-ticket-actions">
                    {revealed && code ? (
                        <button type="button" className="pt-btn" onClick={() => onCopy(code)}>
                            {copied ? 'Copied' : 'Copy code'}
                        </button>
                    ) : null}
                    {revealed ? (
                        <button type="button" className="pt-btn pt-btn-ghost" onClick={onClose}>
                            Close
                        </button>
                    ) : (
                        <button type="button" className="pt-btn pt-btn-ghost" onClick={finish}>
                            Reveal code
                        </button>
                    )}
                </div>
                <p className="pt-ticket-live" role="status">
                    {revealed ? (code ? `Your code is ${code}.` : `${prize}.`) : ''}
                </p>
            </div>
        </div>
    );
}
