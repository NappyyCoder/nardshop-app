import catMark from '../assets/nard-cat-yellow.png';

const mark = { '--cat-mark': `url("${catMark}")` };

export default function GoldCat({ className = '' }) {
    return (
        <span className={`gold-cat ${className}`.trim()} role="img" aria-label="Black cat" style={mark}>
            <span className="gold-cat-stage">
                <span className="gold-cat-coin">
                    <span className="gold-cat-slab" aria-hidden="true" />
                    <span className="gold-cat-face">
                        <span className="gold-cat-depth" aria-hidden="true" />
                        <span className="gold-cat-body" aria-hidden="true" />
                        <span className="gold-cat-glint" aria-hidden="true" />
                    </span>
                </span>
            </span>
        </span>
    );
}
