import { memo, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import catMark from '../assets/nard-cat-yellow.png';
import ScratchTicket from './ScratchTicket';
import { PRIZE } from './prize';

const TARGET = 0;
const TARGETS = [TARGET];
const CARDS = [0, 1, 2, 3];
const SLOTS = [
    { x: '0px', y: '0px' },
    { x: 'calc(100% + 8px)', y: '0px' },
    { x: '0px', y: 'calc(100% + 8px)' },
    { x: 'calc(100% + 8px)', y: 'calc(100% + 8px)' },
];

const SHOW_MS = 4000;
const SHOW_TICKS = 4;
const ROUNDS = {
    1: { show: SHOW_MS, gap: 480 },
    2: { show: SHOW_MS, gap: 360 },
    3: { show: SHOW_MS, gap: 240 },
};
const PLAY_API = '/api/play';
// Matches the .pt-match-inner flip transition.
const FLIP_MS = 360;
// Beat between the cards landing face down and the first swap.
const SETTLE_MS = 650;
const ARC = 0.3;

function moveMs(pace) {
    return Math.max(160, pace.gap - 50);
}

function slotPoint(slot) {
    return { x: slot % 2, y: Math.floor(slot / 2) };
}

// Two swapping cards bow out to opposite sides so they pass instead of sliding through each other.
function arcCard(element, fromSlot, toSlot, duration) {
    if (!element?.animate || !window.CSS?.supports?.('translate', '1px 1px')) return null;
    const from = slotPoint(fromSlot);
    const to = slotPoint(toSlot);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const size = element.offsetWidth * ARC;
    const x = (-dy / length) * size;
    const y = (dx / length) * size;
    return element.animate(
        [
            { translate: '0px 0px', easing: 'ease-out' },
            { translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`, offset: 0.5, easing: 'ease-in' },
            { translate: '0px 0px' },
        ],
        { duration },
    );
}
const STEPS = [
    { id: 1, note: 'Steady' },
    { id: 2, note: 'Faster' },
    { id: 3, note: 'Fastest' },
];
const LIVES = 3;

const MARKS = {
    0: { name: 'Gold card' },
};

let audioContext;

function prefersCalm() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function calmPace(level) {
    const pace = ROUNDS[level] || ROUNDS[1];
    if (!prefersCalm()) return pace;
    return {
        show: Math.round(pace.show * 1.4),
        gap: Math.round(pace.gap * 1.35),
    };
}

async function callPlay(body) {
    const response = await fetch(PLAY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.error || 'network');
        error.code = data.error || 'network';
        throw error;
    }
    return data;
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function prepareAudio() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context || audioContext) return;
    audioContext = new Context();
}

function unlockAudio() {
    prepareAudio();
    if (audioContext?.state === 'suspended') audioContext.resume();
}

function tone(frequency, length, volume = 0.045) {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    const stopAt = audioContext.currentTime + length;
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
    oscillator.start();
    oscillator.stop(stopAt);
}

const COURTS = {
    1: { rank: 'K', name: 'King' },
    2: { rank: 'Q', name: 'Queen' },
    3: { rank: 'J', name: 'Jack' },
};

function Spade() {
    return (
        <svg className="pt-pcard-spade" viewBox="0 0 40 48" aria-hidden="true">
            <path fill="currentColor" d="M20 1.5c-5.6 8.2-14 12.4-14 20.2 0 6.2 4.4 10.4 9.2 11.2-1 2.6-2.8 5.2-5.6 8.1h20.8c-2.8-2.9-4.6-5.5-5.6-8.1 4.8.8 9.2-3.4 9.2-11.2 0-7.8-8.4-12-14-20.2z" />
        </svg>
    );
}

const INK = '#141414';
const GOLD = '#ffd400';
const SKIN = '#f2c9a5';
const PAPER = '#fffdf7';
const STEEL = '#ecebe6';
const SPADE_PATH = 'M20 1.5c-5.6 8.2-14 12.4-14 20.2 0 6.2 4.4 10.4 9.2 11.2-1 2.6-2.8 5.2-5.6 8.1h20.8c-2.8-2.9-4.6-5.5-5.6-8.1 4.8.8 9.2-3.4 9.2-11.2 0-7.8-8.4-12-14-20.2z';

const COURT_STYLE = {
    K: { id: 'nard-k', robe: '#161616', panel: 'check', hair: '#d9a73a' },
    Q: { id: 'nard-q', robe: '#9b1f2e', panel: 'lattice', hair: '#d9a73a' },
    J: { id: 'nard-j', robe: '#1f3a68', panel: 'check', hair: '#6b4426' },
};

function CourtDefs({ id, robe }) {
    return (
        <defs>
            <pattern id={`${id}-check`} width="6" height="6" patternUnits="userSpaceOnUse">
                <rect width="6" height="6" fill={GOLD} />
                <path fill={INK} d="M0 0h3v3H0zm3 3h3v3H3z" />
            </pattern>
            <pattern id={`${id}-lattice`} width="7" height="7" patternUnits="userSpaceOnUse">
                <rect width="7" height="7" fill={GOLD} />
                <path fill="none" stroke={INK} strokeWidth="0.7" d="M0 3.5 3.5 0 7 3.5 3.5 7z" />
                <circle cx="3.5" cy="3.5" r="0.9" fill="#9b1f2e" />
            </pattern>
            <pattern id={`${id}-ermine`} width="8" height="6" patternUnits="userSpaceOnUse">
                <rect width="8" height="6" fill={PAPER} />
                <path fill={INK} d="M3 1.2h2v1.4L4 4.4 3 2.6z" />
            </pattern>
            <pattern id={`${id}-stripe`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="5" height="5" fill={robe} />
                <rect width="1.3" height="5" fill={GOLD} opacity="0.5" />
            </pattern>
            <clipPath id={`${id}-clip`}>
                <rect x="38" y="10" width="84" height="210" />
            </clipPath>
        </defs>
    );
}

function Robe({ id, panel }) {
    return (
        <g>
            <path fill={`url(#${id}-stripe)`} stroke={INK} strokeWidth="1.1" d="M40 115V96c0-11 12-18 25-20l7-1h16l7 1c13 2 25 9 25 20v19z" />
            <path fill={`url(#${id}-ermine)`} stroke={INK} strokeWidth="0.9" d="M40 102c0-13 13-21 28-23l-2 9c-11 2-20 7-26 14z" />
            <path fill={`url(#${id}-ermine)`} stroke={INK} strokeWidth="0.9" d="M120 102c0-13-13-21-28-23l2 9c11 2 20 7 26 14z" />
            <path fill={`url(#${id}-${panel})`} stroke={INK} strokeWidth="1" d="M66 77h28l5 38H61z" />
            <path fill="none" stroke={GOLD} strokeWidth="1.6" d="M66 77 61 115M94 77l5 38" />
            <path fill={GOLD} stroke={INK} strokeWidth="0.8" d="M60.5 103h39l.6 5H59.9z" />
            <circle cx="68" cy="105.5" r="1.4" fill="#9b1f2e" stroke={INK} strokeWidth="0.5" />
            <circle cx="80" cy="105.5" r="1.6" fill={INK} />
            <circle cx="92" cy="105.5" r="1.4" fill="#9b1f2e" stroke={INK} strokeWidth="0.5" />
        </g>
    );
}

function Ruff() {
    return (
        <path
            fill={PAPER}
            stroke={INK}
            strokeWidth="0.9"
            d="M61 72q3 7 6 0q3 7 6 0q3 7 6 0q3 7 6 0q3 7 6 0q3 7 6 0l-1.5-3H62.5z"
        />
    );
}

function Face({ mouth = '#9b1f2e' }) {
    return (
        <g>
            <ellipse cx="80" cy="56" rx="12" ry="14" fill={SKIN} stroke={INK} strokeWidth="1.1" />
            <path fill="none" stroke={INK} strokeWidth="0.9" strokeLinecap="round" d="M71.5 50.6q3-1.8 6.5-.6M82 50q3.5-1.2 6.5.6" />
            <path fill="#fff" stroke={INK} strokeWidth="0.7" d="M72 54.5q3-2.6 6 0q-3 2-6 0zm10 0q3-2.6 6 0q-3 2-6 0z" />
            <circle cx="75" cy="54.4" r="1.05" fill={INK} />
            <circle cx="85" cy="54.4" r="1.05" fill={INK} />
            <path fill="none" stroke={INK} strokeWidth="0.8" strokeLinecap="round" d="M80.4 55.5v6q-1.2 1.2-2.6.5" />
            <circle cx="73" cy="61" r="2.4" fill="#e58f86" opacity="0.35" />
            <circle cx="87" cy="61" r="2.4" fill="#e58f86" opacity="0.35" />
            <path fill="none" stroke={mouth} strokeWidth="1.2" strokeLinecap="round" d="M76.5 65.5q3.5 1.8 7 0" />
        </g>
    );
}

function Hand({ x, y }) {
    return (
        <g>
            <rect x={x} y={y} width="9" height="7" rx="3" fill={SKIN} stroke={INK} strokeWidth="0.8" />
            <path fill="none" stroke={INK} strokeWidth="0.4" d={`M${x + 2} ${y + 2.5}h5M${x + 2} ${y + 4.5}h5`} />
        </g>
    );
}

function Pip({ x, y, scale = 0.22 }) {
    return <path fill={INK} transform={`translate(${x} ${y}) scale(${scale})`} d={SPADE_PATH} />;
}

function KingHalf({ id, hair, panel }) {
    return (
        <g>
            <Robe id={id} panel={panel} />
            <path fill={STEEL} stroke={INK} strokeWidth="0.8" d="M112.5 84V26l1.5-4 1.5 4v58z" />
            <path stroke="#a9a59b" strokeWidth="0.5" d="M114 30v50" />
            <path fill={GOLD} stroke={INK} strokeWidth="0.7" d="M107 84h14v3h-14z" />
            <path fill={INK} d="M112.6 87h2.8v9h-2.8z" />
            <circle cx="114" cy="98" r="2.2" fill={GOLD} stroke={INK} strokeWidth="0.6" />
            <Hand x={109.5} y={88} />
            <path fill={hair} stroke={INK} strokeWidth="0.9" d="M67 46c-6 4-8 12-6 20 2 6 0 10-3 12 6 0 10-4 11-10z" />
            <path fill={hair} stroke={INK} strokeWidth="0.9" d="M93 46c6 4 8 12 6 20-2 6 0 10 3 12-6 0-10-4-11-10z" />
            <Ruff />
            <Face mouth="#d65a5a" />
            <path fill={INK} d="M68.5 60c0 10 5 17 11.5 17s11.5-7 11.5-17c-3 3.5-7 5-11.5 5s-8.5-1.5-11.5-5z" />
            <path fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.75" d="M73 68q2 3 1 6M80 70v6M87 68q-2 3-1 6" />
            <path fill={INK} d="M74 63.6q3-2 6 0q3-2 6 0q-3 2.6-6 .8q-3 1.8-6-.8z" />
            <path fill="none" stroke="#d65a5a" strokeWidth="1" strokeLinecap="round" d="M77.5 66.4q2.5 1 5 0" />
            <path fill="#9b1f2e" stroke={INK} strokeWidth="0.8" d="M64 38c2-9 30-9 32 0z" />
            <path fill={GOLD} stroke={INK} strokeWidth="0.9" d="M63 38l-2-14 8 7 5-11 6 9 6-9 5 11 8-7-2 14z" />
            <path fill={GOLD} stroke={INK} strokeWidth="0.9" d="M63 38h34v6H63z" />
            <circle cx="69" cy="41" r="1.5" fill="#9b1f2e" />
            <circle cx="80" cy="41" r="1.7" fill={INK} />
            <circle cx="91" cy="41" r="1.5" fill="#9b1f2e" />
            <circle cx="61" cy="24" r="1.3" fill={GOLD} stroke={INK} strokeWidth="0.5" />
            <circle cx="99" cy="24" r="1.3" fill={GOLD} stroke={INK} strokeWidth="0.5" />
            <path fill="#9b1f2e" stroke={INK} strokeWidth="0.4" d="M79 16h2v3h3v2h-3v5h-2v-5h-3v-2h3z" />
            <Pip x={41} y={14} />
        </g>
    );
}

function QueenHalf({ id, hair, panel }) {
    return (
        <g>
            <path fill={hair} stroke={INK} strokeWidth="0.9" d="M66 46c-9 6-11 18-9 30 1 8-2 14-6 18 10 0 17-8 17-18z" />
            <path fill={hair} stroke={INK} strokeWidth="0.9" d="M94 46c9 6 11 18 9 30-1 8 2 14 6 18-10 0-17-8-17-18z" />
            <path fill="none" stroke={INK} strokeWidth="0.5" opacity="0.6" d="M62 60q-2 8 0 16M98 60q2 8 0 16M60 82q2 4-1 8M100 82q-2 4 1 8" />
            <Robe id={id} panel={panel} />
            <path fill="none" stroke="#2f6b3a" strokeWidth="1.3" d="M50 112c1-9-1-18 1-27" />
            <path fill="#2f6b3a" d="M50 101c-5-1-7-4-7-7 4 0 7 3 7 7z" />
            <circle cx="51" cy="82" r="5" fill="#c22b3c" stroke={INK} strokeWidth="0.8" />
            <path fill="none" stroke={INK} strokeWidth="0.5" d="M49 82a2 2 0 1 1 2 2a3.2 3.2 0 1 1-3.4-3" />
            <Hand x={46.5} y={88} />
            <Ruff />
            <g fill={PAPER} stroke={INK} strokeWidth="0.4">
                <circle cx="70" cy="79.5" r="1.2" />
                <circle cx="74" cy="81" r="1.2" />
                <circle cx="78" cy="81.8" r="1.2" />
                <circle cx="82" cy="81.8" r="1.2" />
                <circle cx="86" cy="81" r="1.2" />
                <circle cx="90" cy="79.5" r="1.2" />
            </g>
            <Face />
            <path fill={hair} stroke={INK} strokeWidth="0.8" d="M68 48c2-7 22-7 24 0-6-3-18-3-24 0z" />
            <path fill={GOLD} stroke={INK} strokeWidth="0.9" d="M66 40l-1-9 5 4 3-8 4 7 3-9 3 9 4-7 3 8 5-4-1 9z" />
            <path fill={GOLD} stroke={INK} strokeWidth="0.9" d="M66 40h28v5H66z" />
            <circle cx="72" cy="42.5" r="1.2" fill="#9b1f2e" />
            <circle cx="80" cy="42.5" r="1.4" fill={INK} />
            <circle cx="88" cy="42.5" r="1.2" fill="#9b1f2e" />
            <circle cx="80" cy="22" r="1.6" fill="#9b1f2e" stroke={INK} strokeWidth="0.5" />
            <Pip x={41} y={14} />
        </g>
    );
}

function JackHalf({ id, hair, panel }) {
    return (
        <g>
            <Robe id={id} panel={panel} />
            <path stroke="#6b4426" strokeWidth="2.2" d="M46 112V24" />
            <path fill={STEEL} stroke={INK} strokeWidth="0.8" d="M46 13l-2 11h4z" />
            <path fill={STEEL} stroke={INK} strokeWidth="0.8" d="M47 26c8 0 13 4 13 11-4-2-9-2-13 0z" />
            <path fill={STEEL} stroke={INK} strokeWidth="0.8" d="M45 28c-4 1-6 3-6 6 2-1 4-2 6-2z" />
            <Hand x={41.5} y={86} />
            <path fill={hair} stroke={INK} strokeWidth="0.8" d="M69 50c-4 2-5 8-4 14 1 3 3 4 5 3-1-5-1-11 1-17zm22 0c4 2 5 8 4 14-1 3-3 4-5 3 1-5 1-11-1-17z" />
            <Ruff />
            <Face />
            <path fill="none" stroke={hair} strokeWidth="1" strokeLinecap="round" d="M76 63.4q4-1.6 8 0" />
            <path fill="#1f3a68" stroke={INK} strokeWidth="0.9" d="M62 44c0-10 10-16 22-14 10 2 16 8 16 14-12-3-26-3-38 0z" />
            <path fill={GOLD} stroke={INK} strokeWidth="0.8" d="M62 44c12-3 26-3 38 0v3c-12-3-26-3-38 0z" />
            <path fill={GOLD} stroke={INK} strokeWidth="0.8" d="M96 34c6-10 16-13 22-8-6 1-13 5-22 8z" />
            <path fill="none" stroke={INK} strokeWidth="0.5" d="M97 33.5c6-3 12-6 19-7" />
            <circle cx="70" cy="44.5" r="1.3" fill="#9b1f2e" />
            <Pip x={52} y={14} />
        </g>
    );
}

const HALVES = { K: KingHalf, Q: QueenHalf, J: JackHalf };

function CardFrame() {
    return (
        <g fill="none" stroke={INK}>
            <rect x="38" y="10" width="84" height="210" strokeWidth="1.1" />
            <rect x="40.5" y="12.5" width="79" height="205" stroke={GOLD} strokeWidth="1" />
        </g>
    );
}

function CatSeal() {
    return (
        <g>
            <circle cx="80" cy="115" r="9" fill={INK} stroke={GOLD} strokeWidth="1.2" />
            <image href={catMark} x="72.5" y="110.2" width="15" height="9.75" />
        </g>
    );
}

function CourtFace({ rank }) {
    const style = COURT_STYLE[rank] || COURT_STYLE.K;
    const Half = HALVES[rank] || KingHalf;
    return (
        <svg className="pt-face-art" viewBox="0 0 160 230" aria-hidden="true">
            <CourtDefs id={style.id} robe={style.robe} />
            <rect x="38" y="10" width="84" height="210" fill={PAPER} />
            <g clipPath={`url(#${style.id}-clip)`}>
                <Half {...style} />
                <g transform="rotate(180 80 115)">
                    <Half {...style} />
                </g>
            </g>
            <path stroke={INK} strokeWidth="0.8" d="M38 115h84" />
            <CardFrame />
            <CatSeal />
        </svg>
    );
}

function AceFace() {
    return (
        <svg className="pt-face-art" viewBox="0 0 160 230" aria-hidden="true">
            <defs>
                <filter id="nard-ink">
                    <feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 1.4 0" />
                </filter>
            </defs>
            <g fill="none" stroke={INK}>
                <rect x="38" y="10" width="84" height="210" strokeWidth="1.1" />
                <rect x="40.5" y="12.5" width="79" height="205" strokeWidth="0.5" />
                <ellipse cx="80" cy="108" rx="36" ry="32" strokeWidth="0.9" />
                <ellipse cx="80" cy="108" rx="32.5" ry="28.5" strokeWidth="0.5" strokeDasharray="1 2.2" />
            </g>
            <g fill={INK}>
                <path d="M80 72l2.4 3.2L80 78.4l-2.4-3.2z" />
                <path d="M80 137.6l2.4 3.2L80 144l-2.4-3.2z" />
                <path d="M42.4 108l3.2-2.4 3.2 2.4-3.2 2.4z" />
                <path d="M111.2 108l3.2-2.4 3.2 2.4-3.2 2.4z" />
            </g>
            <image href={catMark} x="54" y="91" width="52" height="33.8" filter="url(#nard-ink)" />
            <text x="80" y="166" textAnchor="middle" fill={INK} fontFamily="Palatino, 'Palatino Linotype', Georgia, serif" fontSize="12" fontWeight="700" letterSpacing="4">NARD</text>
            <path stroke={INK} strokeWidth="0.6" d="M58 172h44" />
        </svg>
    );
}

function PlayingFace({ gold, rank = 'K' }) {
    return (
        <span className={`pt-pcard ${gold ? 'pt-pcard-gold' : ''}`}>
            <span className="pt-pcard-center is-court">
                {gold ? <AceFace /> : <CourtFace rank={rank} />}
            </span>
            <span className="pt-pcard-frame" aria-hidden="true" />
            <span className="pt-pcard-index">
                <b>{gold ? 'A' : rank}</b>
                {gold ? <i className="pt-cat-mark" /> : <Spade />}
            </span>
            <span className="pt-pcard-index pt-pcard-index-br">
                <b>{gold ? 'A' : rank}</b>
                {gold ? <i className="pt-cat-mark" /> : <Spade />}
            </span>
        </span>
    );
}

const CardSides = memo(function CardSides({ id }) {
    return (
        <span className="pt-match-inner">
            <span className="pt-match-back">
                <span className="pt-pcard-back">
                    <span className="pt-pcard-frame" aria-hidden="true" />
                    <i className="pt-cat-mark" />
                </span>
            </span>
            <span className="pt-match-front">
                <PlayingFace gold={Boolean(MARKS[id])} rank={COURTS[id]?.rank} />
            </span>
        </span>
    );
});

export default function TwinGame() {
    const orderRef = useRef([0, 1, 2, 3]);
    const soundRef = useRef(true);
    const [order, setOrder] = useState([0, 1, 2, 3]);
    const [faceUp, setFaceUp] = useState(false);
    const [phase, setPhase] = useState('ready');
    const [round, setRound] = useState(1);
    const [lives, setLives] = useState(LIVES);
    const [token, setToken] = useState(0);
    const [picked, setPicked] = useState([]);
    const [wonRound, setWonRound] = useState(false);
    const [result, setResult] = useState(null);
    const [soundOn, setSoundOn] = useState(true);
    const [pace, setPace] = useState(ROUNDS[1]);
    const [copied, setCopied] = useState(false);
    const [count, setCount] = useState(0);
    const [moving, setMoving] = useState([]);
    const [ticketOpen, setTicketOpen] = useState(false);
    const [codeSeen, setCodeSeen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const [coupon, setCoupon] = useState('');
    const roundTokenRef = useRef('');
    const progressRef = useRef(null);
    const swapsRef = useRef([]);
    const outcomeRef = useRef(null);
    const cardRefs = useRef({});
    const boardRef = useRef(null);
    const [snap, setSnap] = useState(false);
    const busyRef = useRef(false);

    soundRef.current = soundOn;

    function setPending(value) {
        busyRef.current = value;
        setBusy(value);
    }

    useEffect(() => {
        if (window.requestIdleCallback) {
            const handle = window.requestIdleCallback(prepareAudio, { timeout: 2000 });
            return () => window.cancelIdleCallback(handle);
        }
        const handle = setTimeout(prepareAudio, 800);
        return () => clearTimeout(handle);
    }, []);

    useEffect(() => {
        if (token === 0) return undefined;
        let cancel = false;
        const roundPace = calmPace(round);

        const run = async () => {
            const stepMs = Math.round(roundPace.show / SHOW_TICKS);
            for (let n = SHOW_TICKS; n >= 1; n -= 1) {
                if (cancel) return;
                setCount(n);
                if (soundRef.current) tone(392 + (SHOW_TICKS - n) * 40, 0.07, 0.04);
                await wait(stepMs);
            }
            if (cancel) return;
            setCount(0);
            setFaceUp(false);
            if (soundRef.current) tone(220, 0.06, 0.03);
            setPhase('shuffle');
            await wait(FLIP_MS + SETTLE_MS);
            let current = orderRef.current;
            const swaps = swapsRef.current;
            const duration = moveMs(roundPace);
            const arcs = !prefersCalm();
            for (let step = 0; step < swaps.length; step += 1) {
                if (step > 0) await wait(roundPace.gap);
                if (cancel) return;
                const [a, b] = swaps[step];
                const moved = [current[a], current[b]];
                const next = [...current];
                [next[a], next[b]] = [next[b], next[a]];
                current = next;
                orderRef.current = current;
                flushSync(() => {
                    setMoving(moved);
                    setOrder(next);
                });
                if (arcs) {
                    running.forEach((animation) => animation.cancel());
                    running = [
                        arcCard(cardRefs.current[moved[0]], a, b, duration),
                        arcCard(cardRefs.current[moved[1]], b, a, duration),
                    ].filter(Boolean);
                }
                if (soundRef.current) tone(280 + step * 20, 0.05, 0.03);
            }
            await wait(Math.max(duration, Math.min(320, roundPace.gap)));
            if (cancel) return;
            setMoving([]);
            setPhase('pick');
        };

        let running = [];
        run();
        return () => {
            cancel = true;
            running.forEach((animation) => animation.cancel());
        };
    }, [token, round]);

    useEffect(() => {
        if (phase !== 'reveal') return undefined;
        const outcome = outcomeRef.current || {};
        const timer = setTimeout(() => {
            setLives(outcome.lives ?? lives);
            if (!wonRound) {
                if (outcome.over) {
                    setResult({
                        prize: null,
                        detail: 'No lives left. Back to round 1.',
                    });
                    setPhase('done');
                    return;
                }
                setResult(null);
                setPhase('retry');
                return;
            }
            if (outcome.code) {
                setCoupon(outcome.code);
                setResult({
                    prize: PRIZE,
                    detail: 'Three rounds. The gold card. 20% off, available for a limited time.',
                });
                setPhase('done');
                return;
            }
            setResult(null);
            setPhase('next');
        }, 780);
        return () => clearTimeout(timer);
    }, [phase, wonRound, lives]);

    async function begin() {
        if (busyRef.current) return;
        unlockAudio();
        setPending(true);
        setNotice('');
        const flipStart = performance.now();
        const wasUp = faceUp;
        if (wasUp) setFaceUp(false);
        let data;
        try {
            data = await callPlay({ action: 'deal', progress: progressRef.current, calm: prefersCalm() });
        } catch {
            setPending(false);
            setNotice('Could not deal the cards. Check your connection and try again.');
            return;
        }
        if (wasUp) await wait(Math.max(0, FLIP_MS - (performance.now() - flipStart)));
        setPending(false);
        roundTokenRef.current = data.token;
        swapsRef.current = data.swaps;
        outcomeRef.current = null;
        orderRef.current = data.order;
        flushSync(() => {
            setSnap(true);
            setMoving([]);
            setOrder(data.order);
        });
        void boardRef.current?.offsetWidth;
        setSnap(false);
        setRound(data.round);
        setLives(data.lives);
        setPace(calmPace(data.round));
        setPicked([]);
        setWonRound(false);
        setResult(null);
        setCopied(false);
        setTicketOpen(false);
        setCodeSeen(false);
        setFaceUp(true);
        setCount(SHOW_TICKS);
        setMoving([]);
        setPhase('show');
        setToken((value) => value + 1);
        if (soundRef.current) tone(494, 0.08);
    }

    function toggle(id) {
        if (phase !== 'pick' || busyRef.current) return;
        if (!picked.includes(id) && soundRef.current) tone(660, 0.05);
        setNotice('');
        setPicked((current) => (current[0] === id ? [] : [id]));
    }

    async function lockIn() {
        if (phase !== 'pick' || picked.length !== 1 || busyRef.current) return;
        setPending(true);
        setNotice('');
        let data;
        try {
            data = await callPlay({ action: 'pick', token: roundTokenRef.current, slot: orderRef.current.indexOf(picked[0]) });
        } catch (error) {
            setPending(false);
            if (error.code === 'expired' || error.code === 'bad-token') {
                progressRef.current = null;
                setPicked([]);
                setNotice('That deal timed out. Deal again to start over.');
                setPhase('ready');
                return;
            }
            setNotice('Could not check your pick. Tap Lock it in again.');
            return;
        }
        setPending(false);
        outcomeRef.current = data;
        progressRef.current = data.progress || null;
        const won = Boolean(data.correct);
        setWonRound(won);
        setFaceUp(true);
        setPhase('reveal');
        if (soundRef.current) {
            if (won) {
                tone(523, 0.09, 0.05);
                setTimeout(() => tone(659, 0.1, 0.05), 90);
                setTimeout(() => tone(784, 0.18, 0.05), 180);
            } else {
                tone(130, 0.18, 0.04);
            }
        }
    }

    const actionsRef = useRef({});
    actionsRef.current = { phase, order, toggle, lockIn };

    useEffect(() => {
        const onKey = (event) => {
            const actions = actionsRef.current;
            if (actions.phase !== 'pick') return;
            if (event.key === 'Enter') {
                actions.lockIn();
                return;
            }
            const slot = Number(event.key) - 1;
            if (slot < 0 || slot > 3) return;
            const id = actions.order[slot];
            if (id === undefined) return;
            actions.toggle(id);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    function playAgain() {
        progressRef.current = null;
        setCoupon('');
        setLives(LIVES);
        begin();
    }

    async function copyCode(code) {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }

    const lastLife = lives === 1;
    const status = notice || {
        ready: 'Deal the cards. Remember the gold card, then find it.',
        show: lastLife ? 'Last life. Remember the gold card.' : 'Remember the gold card.',
        count: lastLife ? `Last life. Shuffle in ${count}.` : `Shuffle in ${count}.`,
        shuffle: lastLife ? 'Last life. Follow the gold card.' : 'Follow the gold card.',
        pick: lastLife
            ? (picked.length === 1 ? 'Last life. Lock in only when you are sure.' : 'Last life. Tap the gold card.')
            : (picked.length === 1 ? 'Lock it in, or tap it to change it.' : 'Tap the gold card.'),
        reveal: wonRound ? 'Found it.' : 'Not the gold card.',
        retry: lastLife ? 'Last life. Same round. Lock in only when you are sure.' : 'Missed. Same round.',
        next: lastLife
            ? (round === 1 ? 'Last life. Faster shuffle next.' : 'Last life. Fastest shuffle next.')
            : (round === 1 ? 'Same cat. Faster shuffle next.' : 'Same cat. Fastest shuffle next.'),
        done: result?.prize ? '20% off is yours. Available for a limited time.' : 'No lives left. Back to round 1.',
    }[phase];
    const statusTone = notice
        ? 'bad'
        : (phase === 'reveal' && wonRound) || phase === 'next' || (phase === 'done' && result?.prize)
        ? 'good'
        : (phase === 'reveal' && !wonRound) || phase === 'retry' || (phase === 'done' && result && !result.prize)
            ? 'bad'
            : '';
    const showDock = phase === 'ready'
        || (phase === 'pick' && picked.length === 1)
        || phase === 'retry'
        || phase === 'next'
        || (phase === 'done' && !ticketOpen);

    useEffect(() => {
        if (phase === 'done' && result?.prize) {
            setTicketOpen(true);
            setCodeSeen(false);
            return undefined;
        }
        setTicketOpen(false);
        return undefined;
    }, [phase, result]);

    function stepState(id) {
        const cleared = id < round || (id === round && (phase === 'next' || (phase === 'done' && result?.prize)));
        if (cleared) return 'won';
        if (id === round && !(phase === 'done' && !result?.prize)) return 'now';
        return '';
    }

    return (
        <section className={`pt-match ${showDock ? 'has-dock' : ''}`} style={{ '--cat-mark': `url("${catMark}")` }}>
            <header className="pt-match-head">
                <div>
                    <p className="pt-kicker">Matching game</p>
                    <h1>Find the card</h1>
                </div>
                <button
                    type="button"
                    className={`pt-match-sound ${soundOn ? 'on' : ''}`}
                    aria-pressed={soundOn}
                    onClick={() => {
                        unlockAudio();
                        setSoundOn((value) => !value);
                    }}
                >
                    {soundOn ? 'Sound on' : 'Sound off'}
                </button>
            </header>

            {phase === 'ready' && !notice ? (
                <div className="pt-match-how">
                    <p className="pt-kicker">Black Friday · 20% off</p>
                    <h2>Find the gold card</h2>
                    <p>4 seconds to remember it, then tap it after the shuffle. 3 rounds, 3 chances.</p>
                </div>
            ) : (
                <p className={`pt-match-status ${statusTone} ${lastLife && phase !== 'done' ? 'last' : ''}`} role="status">{status}</p>
            )}

            {phase !== 'ready' && (
                <>
                    <p className="pt-match-prize"><span>Black Friday</span> 20% off</p>
                    <div className={`pt-match-lives ${lastLife ? 'last' : ''}`} aria-label={`${lives} ${lives === 1 ? 'life' : 'lives'} left`}>
                        {Array.from({ length: LIVES }, (_, index) => (
                            <span key={index} className={`pt-cat-mark ${index < lives ? 'on' : 'off'}`} />
                        ))}
                        {lastLife && <span>Last life</span>}
                    </div>
                    <ol className="pt-match-steps">
                        {STEPS.map((step) => {
                            const state = stepState(step.id);
                            return (
                                <li key={step.id} className={state} aria-current={state === 'now' ? 'step' : undefined}>
                                    <small>Round {step.id}</small>
                                    <strong>{state === 'won' ? 'Done' : step.note}</strong>
                                </li>
                            );
                        })}
                    </ol>
                </>
            )}

            <div className="pt-match-layout">
                <div className="pt-match-copy">
                    {phase === 'done' && result?.prize && !ticketOpen && (
                        <button
                            type="button"
                            className="pt-match-link"
                            onClick={() => {
                                setCopied(false);
                                setCodeSeen(false);
                                setTicketOpen(true);
                            }}
                        >
                            See the ticket
                        </button>
                    )}
                </div>

                <div className={`pt-match-stage ${wonRound && (phase === 'reveal' || phase === 'next') ? 'rewarded' : ''}`}>
                    {phase === 'show' && (
                        <div className="pt-match-timer" role="timer" aria-live="polite" aria-label={`Shuffle in ${count}`}>
                            <span style={{ animationDuration: `${pace.show}ms` }} />
                            <b>{count}</b>
                        </div>
                    )}
                    <div ref={boardRef} className={`pt-match-board ${moving.length ? 'tracking' : ''}`}>
                        {CARDS.map((id) => {
                            const slot = SLOTS[order.indexOf(id)];
                            const selected = picked.includes(id);
                            const target = TARGETS.includes(id);
                            const showFront = faceUp;
                            const showMarks = phase === 'reveal' || phase === 'next' || phase === 'retry' || phase === 'done';
                            let mark = '';
                            if (showMarks && selected && target) mark = 'hit';
                            if (showMarks && selected && !target) mark = 'miss';
                            if (showMarks && target && !selected) mark = 'answer';
                            return (
                                <button
                                    key={id}
                                    ref={(element) => {
                                        cardRefs.current[id] = element;
                                    }}
                                    type="button"
                                    className={`pt-match-card ${showFront ? 'up' : ''} ${selected ? 'selected' : ''} ${moving.includes(id) ? 'moving' : ''} ${mark}`}
                                    style={{
                                        '--x': slot.x,
                                        '--y': slot.y,
                                        transitionDuration: snap ? '0ms' : `${moveMs(pace)}ms`,
                                    }}
                                    onClick={() => toggle(id)}
                                    disabled={phase !== 'pick'}
                                    aria-pressed={selected}
                                    aria-label={MARKS[id] ? MARKS[id].name : COURTS[id].name}
                                >
                                    <CardSides id={id} />
                                    {selected && phase === 'pick' && (
                                        <span className="pt-match-badge">{picked.indexOf(id) + 1}</span>
                                    )}
                                    {mark === 'hit' && <span className="pt-match-tag found">Found</span>}
                                    {mark === 'miss' && <span className="pt-match-tag wrong">Wrong</span>}
                                    {mark === 'answer' && <span className="pt-match-tag found">This one</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {showDock && (
                    <div className="pt-match-dock">
                        {phase === 'ready' && (
                            <button type="button" className="pt-btn" onClick={begin} disabled={busy}>
                                {busy ? 'Dealing…' : 'Deal the cards'}
                            </button>
                        )}
                        {phase === 'pick' && picked.length === 1 && (
                            <button type="button" className={`pt-btn ${lastLife ? 'pt-btn-last' : ''}`} onClick={lockIn} disabled={busy}>
                                {busy ? 'Checking…' : lastLife ? 'Last life. Lock in' : 'Lock it in'}
                            </button>
                        )}
                        {phase === 'retry' && (
                            <button type="button" className={`pt-btn ${lastLife ? 'pt-btn-last' : ''}`} onClick={begin} disabled={busy}>
                                {busy ? 'Dealing…' : lastLife ? 'Last life. Try this round' : 'Try this round again'}
                            </button>
                        )}
                        {phase === 'next' && (
                            <button type="button" className="pt-btn" onClick={begin} disabled={busy}>
                                {busy ? 'Dealing…' : round === 1 ? 'Play round 2' : 'Play the last round'}
                            </button>
                        )}
                        {phase === 'done' && (
                            <button type="button" className="pt-btn" onClick={playAgain} disabled={busy}>
                                {busy ? 'Dealing…' : 'Play again'}
                            </button>
                        )}
                        {phase === 'done' && coupon && codeSeen && (
                            <button type="button" className="pt-btn pt-btn-ghost" onClick={() => copyCode(coupon)}>
                                {copied ? 'Copied' : `Copy ${coupon}`}
                            </button>
                        )}
                    </div>
                )}
            </div>
            {ticketOpen && result?.prize && (
                <ScratchTicket
                    prize={result.prize}
                    code={coupon}
                    copied={copied}
                    onCopy={copyCode}
                    onClose={() => {
                        setCodeSeen(true);
                        setTicketOpen(false);
                    }}
                />
            )}
        </section>
    );
}
