import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TvBoot from '../components/TvBoot';
import DropCube, { TvCube } from '../components/DropCube';
import { TIKTOK_PATH } from '../components/catCube';
import faceLogo from '../assets/nard-face-white.png';
import nathanAvif480 from '../assets/twins/nard-nathan-480.avif';
import nathanAvif649 from '../assets/twins/nard-nathan-649.avif';
import nathanWebp480 from '../assets/twins/nard-nathan-480.webp';
import nathanWebp649 from '../assets/twins/nard-nathan-649.webp';
import nathanJpg from '../assets/twins/nard-nathan-649.jpg';
import leonardAvif480 from '../assets/twins/nard-leonard-480.avif';
import leonardAvif623 from '../assets/twins/nard-leonard-623.avif';
import leonardWebp480 from '../assets/twins/nard-leonard-480.webp';
import leonardWebp623 from '../assets/twins/nard-leonard-623.webp';
import leonardJpg from '../assets/twins/nard-leonard-623.jpg';
import { subscribeKlaviyoSms } from '../services/klaviyoSms';
import { bindTiltUnlock, createTiltMemory, isDeviceTiltUnlocked, resetDeviceTilt, subscribeDeviceTilt, subscribeTiltReset, subscribeTiltUnlock, tiltOffset, unlockDeviceTilt } from '../hooks/deviceTilt';
import '../styles/coming-soon.css';

const SMS_NUMBER = import.meta.env.VITE_SMS_NUMBER;
const PLAY_URL = import.meta.env.DEV ? '/play' : 'https://nardshop-play.vercel.app/play';
const WAITLIST_MAIL = 'info@nardshop.com';
const DROP_AT = new Date(import.meta.env.VITE_DROP_DATE || '2026-10-29T15:00:00-04:00');
const DROP_NOTE = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
}).format(DROP_AT);

const CREATORS = [
    {
        mark: 'NA',
        name: 'Nathan',
        title: 'Graphic Designer',
        take: 'Designed the signal you see.',
        ch: '25',
        photo: {
            avif: `${nathanAvif480} 480w, ${nathanAvif649} 649w`,
            webp: `${nathanWebp480} 480w, ${nathanWebp649} 649w`,
            jpg: nathanJpg,
            width: 649,
            height: 974,
        },
    },
    {
        mark: 'RD',
        name: 'Leonard',
        title: 'Web Developer',
        take: "Built the signal you're on.",
        ch: '26',
        photo: {
            avif: `${leonardAvif480} 480w, ${leonardAvif623} 623w`,
            webp: `${leonardWebp480} 480w, ${leonardWebp623} 623w`,
            jpg: leonardJpg,
            width: 623,
            height: 933,
        },
    },
];

const TWIN_SIZES = '(max-width: 560px) min(86vw, 384px), 384px';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const TwinCard = ({ creator }) => {
    const cardRef = useRef(null);
    const imgRef = useRef(null);
    const pointerRef = useRef('mouse');
    const [loaded, setLoaded] = useState(false);
    const [on, setOn] = useState(false);

    useEffect(() => {
        if (imgRef.current?.complete) setLoaded(true);
    }, []);

    useEffect(() => {
        const card = cardRef.current;
        if (!card || !window.matchMedia('(hover: none)').matches) return undefined;
        const see = new IntersectionObserver(([entry]) => {
            setOn(entry.intersectionRatio >= 0.6);
        }, { threshold: [0, 0.6] });
        see.observe(card);
        return () => see.disconnect();
    }, []);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return undefined;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const state = {
            aimX: 0,
            aimY: 0,
            rotX: 0,
            rotY: 0,
            pointer: false,
            tilt: false,
            memory: createTiltMemory(),
            reduce: motion.matches,
            visible: true,
            looping: false,
        };

        const paint = () => {
            const lift = state.pointer || state.tilt ? 8 : 0;
            card.style.transform = `rotateX(${state.rotX}deg) rotateY(${state.rotY}deg) translateZ(${lift}px)`;
        };

        let frame = 0;
        const tick = () => {
            if (!state.visible) {
                state.looping = false;
                return;
            }
            state.rotX += (state.aimX - state.rotX) * 0.12;
            state.rotY += (state.aimY - state.rotY) * 0.12;
            paint();
            const settled = Math.abs(state.aimX - state.rotX) < 0.05 && Math.abs(state.aimY - state.rotY) < 0.05;
            if (settled && !state.pointer && !state.tilt) {
                state.looping = false;
                return;
            }
            frame = requestAnimationFrame(tick);
        };

        const kick = () => {
            if (state.looping || !state.visible) return;
            state.looping = true;
            frame = requestAnimationFrame(tick);
        };

        const faceForward = () => {
            state.memory = createTiltMemory();
            state.tilt = false;
            state.pointer = false;
            state.aimX = 0;
            state.aimY = 0;
            kick();
        };

        const aimAt = (clientX, clientY) => {
            const box = card.getBoundingClientRect();
            const nx = clamp((clientX - (box.left + box.width / 2)) / (box.width / 2), -1, 1);
            const ny = clamp((clientY - (box.top + box.height / 2)) / (box.height / 2), -1, 1);
            state.aimY = nx * 7;
            state.aimX = -ny * 5;
            kick();
        };

        const follow = (event) => {
            if (event.pointerType !== 'mouse' || state.reduce) return;
            state.pointer = true;
            state.tilt = false;
            aimAt(event.clientX, event.clientY);
        };

        const leave = () => {
            if (!state.tilt) {
                state.pointer = false;
                state.aimX = 0;
                state.aimY = 0;
                kick();
            }
        };

        const onPose = (next) => {
            if (!coarse || state.pointer || !state.visible || state.reduce) return;
            const delta = tiltOffset(next.beta, next.gamma, state.memory);
            if (!delta || (delta.x === 0 && delta.y === 0)) {
                state.tilt = false;
                if (!state.pointer) {
                    state.aimX = 0;
                    state.aimY = 0;
                }
                kick();
                return;
            }
            state.tilt = true;
            state.aimY = clamp(delta.y / 3.2, -6, 6);
            state.aimX = clamp(-delta.x / 4, -4, 4);
            kick();
        };

        const onMotion = () => {
            state.reduce = motion.matches;
        };

        motion.addEventListener('change', onMotion);
        const stopTilt = subscribeDeviceTilt(onPose);
        const stopUnlock = subscribeTiltUnlock(faceForward);
        const stopReset = subscribeTiltReset(faceForward);
        const see = new IntersectionObserver(([entry]) => {
            state.visible = entry.isIntersecting;
            if (state.visible) kick();
        }, { rootMargin: '80px' });
        see.observe(card);
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        card.addEventListener('pointermove', follow, { passive: true });
        card.addEventListener('pointerleave', leave);
        return () => {
            cancelAnimationFrame(frame);
            see.disconnect();
            stopTilt();
            stopUnlock();
            stopReset();
            motion.removeEventListener('change', onMotion);
            card.removeEventListener('pointermove', follow);
            card.removeEventListener('pointerleave', leave);
        };
    }, []);

    return (
        <figure
            ref={cardRef}
            className={`twin-card${on ? ' is-on' : ''}`}
            tabIndex={0}
            aria-label={`${creator.name}, ${creator.title}`}
            onPointerDown={(event) => { pointerRef.current = event.pointerType; }}
            onPointerEnter={(event) => { if (event.pointerType === 'mouse') setOn(true); }}
            onPointerLeave={(event) => { if (event.pointerType === 'mouse') setOn(false); }}
            onClick={() => { if (pointerRef.current !== 'mouse') setOn((value) => !value); }}
            onFocus={(event) => { if (event.target.matches(':focus-visible')) setOn(true); }}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOn(false);
            }}
        >
            <picture>
                <source type="image/avif" srcSet={creator.photo.avif} sizes={TWIN_SIZES} />
                <source type="image/webp" srcSet={creator.photo.webp} sizes={TWIN_SIZES} />
                <img
                    ref={imgRef}
                    src={creator.photo.jpg}
                    width={creator.photo.width}
                    height={creator.photo.height}
                    alt={`${creator.name}, ${creator.title}, wearing NARD`}
                    loading="lazy"
                    decoding="async"
                    className={loaded ? 'is-loaded' : ''}
                    onLoad={() => setLoaded(true)}
                />
            </picture>
            <span className="twin-static" aria-hidden="true" />
            <span className="twin-ch" aria-hidden="true">CH {creator.ch}</span>
            <figcaption className="twin-caption">
                <span className="creator-name">
                    {creator.mark === 'NA' ? (
                        <>
                            <span className="name-mark">NA</span>
                            <span className="name-plain">THAN</span>
                        </>
                    ) : (
                        <>
                            <span className="name-plain">LEONA</span>
                            <span className="name-mark">RD</span>
                        </>
                    )}
                </span>
                <span className="creator-title">{creator.title}</span>
                <span className="creator-take">{creator.take}</span>
            </figcaption>
        </figure>
    );
};

const ease = [0.16, 0.7, 0.18, 1];

const group = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const rise = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const riseClean = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
};

const inView = {
    variants: group,
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true, amount: 0.25 },
};

const useDropClock = () => {
    const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0 });

    useEffect(() => {
        const tick = () => {
            const left = Math.max(0, DROP_AT.getTime() - Date.now());
            setParts({
                d: Math.floor(left / 86400000),
                h: Math.floor((left % 86400000) / 3600000),
                m: Math.floor((left % 3600000) / 60000),
                s: Math.floor((left % 60000) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return parts;
};

const pad = (value) => String(value).padStart(2, '0');

const Countdown = () => {
    const parts = useDropClock();

    return (
        <div className="drop-clock">
            <p className="drop-kicker">Drops in</p>
            <div className="countdown" aria-label="Time until the drop">
                {[
                    ['Days', parts.d],
                    ['Hrs', parts.h],
                    ['Min', parts.m],
                    ['Sec', parts.s],
                ].map(([label, value], index) => (
                    <div key={label} className="countdown-pair">
                        {index > 0 && <span className="countdown-colon" aria-hidden="true">:</span>}
                        <div className="countdown-unit">
                            <span key={value} className="countdown-digit">{pad(value)}</span>
                            <small>{label}</small>
                        </div>
                    </div>
                ))}
            </div>
            <p className="drop-note">The signal · {DROP_NOTE}</p>
        </div>
    );
};

const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length < 11) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
};

const TextAlert = () => {
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState('idle');

    const onSubmit = async (event) => {
        event.preventDefault();
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 10) {
            setStatus('error');
            return;
        }

        setStatus('sending');
        try {
            await subscribeKlaviyoSms(digits);
        } catch {
            setStatus('fail');
            return;
        }

        const stored = JSON.parse(localStorage.getItem('nard-drop-texts') || '[]');
        if (!stored.includes(digits)) {
            stored.push(digits);
            localStorage.setItem('nard-drop-texts', JSON.stringify(stored));
        }

        setStatus('sent');
        setPhone('');
        window.dispatchEvent(new CustomEvent('nard-tv-channel', { detail: 'on' }));
        document.querySelector('.drop-cube')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (status === 'sent') {
        return (
            <p className="signup-done">You&apos;re on the list.</p>
        );
    }

    return (
        <form className="signup" onSubmit={onSubmit}>
            <label htmlFor="nard-drop-phone">Get a text</label>
            <div className="signup-row">
                <input
                    id="nard-drop-phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(event) => {
                        setPhone(formatPhone(event.target.value));
                        if (status === 'error' || status === 'fail') setStatus('idle');
                    }}
                    aria-invalid={status === 'error'}
                />
                <button type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Joining' : 'Join'}
                </button>
            </div>
            <p className="signup-legal">
                You agree to get a drop text from NARD. Msg &amp; data rates may apply.
            </p>
            {SMS_NUMBER && (
                <a className="signup-link" href={`sms:${SMS_NUMBER}?&body=DROP`}>
                    Or text DROP to {SMS_NUMBER}
                </a>
            )}
            {status === 'error' && <p className="signup-error">Enter a valid number.</p>}
            {status === 'fail' && <p className="signup-error">Couldn&apos;t add that number. Try again.</p>}
        </form>
    );
};

const TwinsHead = () => (
    <motion.div className="twins-head" variants={rise}>
        <h2 className="twins-title">The twins</h2>
        <p className="twins-hint">
            <span className="hint-hover">Hover to tune in</span>
            <span className="hint-touch">Scroll to tune in</span>
        </p>
    </motion.div>
);

const MotionGate = () => {
    const btnRef = useRef(null);
    const [needed, setNeeded] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const phone = window.matchMedia('(pointer: coarse), (max-width: 800px)').matches;
        const canAsk = typeof DeviceOrientationEvent !== 'undefined'
            && typeof DeviceOrientationEvent.requestPermission === 'function';
        if (!phone && !canAsk) return undefined;
        if (isDeviceTiltUnlocked()) {
            if (phone) setReady(true);
            return undefined;
        }
        setNeeded(true);
        return subscribeTiltUnlock(() => {
            setNeeded(false);
            if (phone) setReady(true);
        });
    }, []);

    useEffect(() => {
        if (!needed) return undefined;
        return bindTiltUnlock(btnRef.current);
    }, [needed]);

    if (needed) {
        return (
            <button
                ref={btnRef}
                type="button"
                className="motion-gate"
                onClick={unlockDeviceTilt}
            >
                Allow motion
            </button>
        );
    }

    if (!ready) return null;

    return (
        <button
            type="button"
            className="motion-reset"
            onClick={resetDeviceTilt}
        >
            Reset view
        </button>
    );
};

const ComingSoon = () => {
    const [booting, setBooting] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 80);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);


    return (
        <div className="coming-soon">
            <AnimatePresence>
                {booting && <TvBoot key="boot" onDone={() => setBooting(false)} />}
            </AnimatePresence>
            <div className="page-static" aria-hidden="true" />
            <div className="page-scan" aria-hidden="true" />

            <main className="page">
                <section id="drop" className="section section--drop">
                    <motion.div
                        className="section-inner"
                        variants={group}
                        initial="hidden"
                        animate={booting ? 'hidden' : 'show'}
                    >
                        <h1 className="sr-only">NARD drop coming soon</h1>
                        <motion.div variants={riseClean}>
                            <DropCube />
                        </motion.div>
                        <div className="drop-meta">
                            <MotionGate />
                            <motion.div variants={rise}>
                                <Countdown />
                            </motion.div>
                            <motion.div className="signup-wrap" variants={rise}>
                                <TextAlert />
                            </motion.div>
                            <motion.div variants={rise}>
                                <a className="play-link" href={PLAY_URL}>Play the game</a>
                            </motion.div>
                            <motion.div className="follow-signal" variants={rise}>
                                <h2 className="follow-signal-kicker">Follow</h2>
                                <nav className="site-social" aria-label="NARD on social">
                                    <a
                                        className="social-tv"
                                        href="https://www.instagram.com/_NardShop_/"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <TvCube skin="white" logo="instagram" canTune={false} className="social-tv-cube" />
                                        <span>
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                                <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                                <circle cx="17.15" cy="6.85" r="1.15" fill="currentColor" />
                                            </svg>
                                            @_NardShop_
                                        </span>
                                    </a>
                                    <a
                                        className="social-tv"
                                        href="https://www.tiktok.com/@Nardshopp"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <TvCube skin="black" logo="tiktok" canTune={false} className="social-tv-cube" />
                                        <span>
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path fill="currentColor" d={TIKTOK_PATH} />
                                            </svg>
                                            @Nardshopp
                                        </span>
                                    </a>
                                </nav>
                            </motion.div>
                        </div>
                    </motion.div>
                    <a
                        className={`scroll-cue ${booting ? '' : 'is-ready'} ${scrolled ? 'is-gone' : ''}`}
                        href="#twins"
                    >
                        <span className="scroll-cue-mouse" aria-hidden="true">
                            <span className="scroll-cue-wheel" />
                        </span>
                        <span className="chevron chevron--bounce" aria-hidden="true" />
                    </a>
                </section>

                <section id="twins" className="section">
                    <motion.div className="section-inner" {...inView}>
                        <TwinsHead />
                        <motion.div className="twins" variants={rise}>
                            {CREATORS.map((creator) => (
                                <TwinCard key={creator.mark} creator={creator} />
                            ))}
                        </motion.div>
                    </motion.div>
                </section>
            </main>

            <footer className="site-footer">
                <div className="site-footer-brand">
                    <span className="site-footer-mark">
                        <img src={faceLogo} alt="" />
                    </span>
                    <p>Wherever life takes you.</p>
                </div>
                <nav className="site-footer-social" aria-label="NARD on social">
                    <a href="https://www.instagram.com/_NardShop_/" target="_blank" rel="noreferrer">@_NardShop_</a>
                    <a href="https://www.tiktok.com/@Nardshopp" target="_blank" rel="noreferrer">@Nardshopp</a>
                    <a href={`mailto:${WAITLIST_MAIL}`}>{WAITLIST_MAIL}</a>
                </nav>
                <p className="site-footer-fine">&copy; {new Date().getFullYear()} NARD</p>
            </footer>
        </div>
    );
};

export default ComingSoon;
