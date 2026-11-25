import { useState } from 'react';
import ScratchTicket from './ScratchTicket';
import { COUPON_CODE } from './prize';

export function GameFrame({ title, note, children }) {
    return (
        <section className="pt-game">
            <h2>{title}</h2>
            <p className="pt-note">{note}</p>
            {children}
        </section>
    );
}

export function PrizeResult({ prize, detail, onAgain, againLabel = 'Play again', code }) {
    const ticketCode = prize ? (code || COUPON_CODE) : '';
    const [open, setOpen] = useState(Boolean(ticketCode));
    const [copied, setCopied] = useState(false);

    async function copyCode(value) {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }

    return (
        <>
            <div className={`pt-result ${prize ? 'win' : 'miss'}`} role="status">
                <p className="pt-kicker">{prize ? 'Prize' : 'No prize'}</p>
                <h3>{prize || 'Try again'}</h3>
                {detail ? <p>{detail}</p> : null}
                <div className="pt-result-actions">
                    {ticketCode && !open && (
                        <button type="button" className="pt-btn" onClick={() => setOpen(true)}>
                            See the ticket
                        </button>
                    )}
                    <button type="button" className="pt-btn" onClick={onAgain}>
                        {againLabel}
                    </button>
                </div>
            </div>
            {open && ticketCode && (
                <ScratchTicket
                    prize={prize}
                    code={ticketCode}
                    copied={copied}
                    onCopy={copyCode}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
