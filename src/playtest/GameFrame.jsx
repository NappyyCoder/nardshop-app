import { Link } from 'react-router-dom';

export function GameFrame({ title, note, children }) {
    return (
        <section className="pt-game">
            <h2>{title}</h2>
            <p className="pt-note">{note}</p>
            {children}
        </section>
    );
}

export function PrizeResult({ prize, detail, onAgain, againLabel = 'Play again' }) {
    return (
        <div className={`pt-result ${prize ? 'win' : 'miss'}`} role="status">
            <p className="pt-kicker">{prize ? 'Prize' : 'No prize'}</p>
            <h3>{prize || 'Try again'}</h3>
            {detail ? <p>{detail}</p> : null}
            {prize ? <p>Claim your 20% code by clearing Find the card.</p> : null}
            <div className="pt-result-actions">
                {prize && (
                    <Link className="pt-btn" to="/play">
                        Play Find the card
                    </Link>
                )}
                <button type="button" className="pt-btn" onClick={onAgain}>
                    {againLabel}
                </button>
            </div>
        </div>
    );
}
