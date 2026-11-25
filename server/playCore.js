import { Buffer } from 'node:buffer';
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

const TARGET = 0;
const LIVES = 3;
const LAST_ROUND = 3;
const SHOW_MS = 4000;
const ROUNDS = {
    1: { swaps: 4, gap: 480 },
    2: { swaps: 6, gap: 360 },
    3: { swaps: 8, gap: 240 },
};
// Network jitter and timer drift; a real player is never this far ahead of the animation.
const SLACK_MS = 900;
const ROUND_TTL_MS = 15 * 60 * 1000;
const PROGRESS_TTL_MS = 30 * 60 * 1000;

function encode(value) {
    return Buffer.from(value).toString('base64url');
}

function sign(payload, secret) {
    const body = encode(JSON.stringify(payload));
    const mac = createHmac('sha256', secret).update(body).digest('base64url');
    return `${body}.${mac}`;
}

function verify(token, secret) {
    if (typeof token !== 'string' || token.length > 2048) return null;
    const [body, mac] = token.split('.');
    if (!body || !mac) return null;
    const expected = createHmac('sha256', secret).update(body).digest();
    let given;
    try {
        given = Buffer.from(mac, 'base64url');
    } catch {
        return null;
    }
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    try {
        return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    } catch {
        return null;
    }
}

function shuffledOrder() {
    const order = [0, 1, 2, 3];
    for (let index = order.length - 1; index > 0; index -= 1) {
        const swap = randomInt(index + 1);
        [order[index], order[swap]] = [order[swap], order[index]];
    }
    return order;
}

function swapList(start, count) {
    const swaps = [];
    let order = [...start];
    let previous = '';
    for (let step = 0; step < count; step += 1) {
        const first = order.indexOf(TARGET);
        let second = randomInt(4);
        let guard = 0;
        while ((second === first || [first, second].sort().join('-') === previous) && guard < 8) {
            second = randomInt(4);
            guard += 1;
        }
        if (second === first) second = (first + 1 + randomInt(3)) % 4;
        const next = [...order];
        [next[first], next[second]] = [next[second], next[first]];
        order = next;
        previous = [first, second].sort().join('-');
        swaps.push([first, second]);
    }
    return swaps;
}

function finalOrder(start, swaps) {
    const order = [...start];
    for (const [a, b] of swaps) [order[a], order[b]] = [order[b], order[a]];
    return order;
}

function minPlayMs(round, swaps) {
    const { gap } = ROUNDS[round];
    return SHOW_MS + Math.max(0, swaps - 1) * gap - SLACK_MS;
}

function deal(body, { secret, now }) {
    let round = 1;
    let lives = LIVES;
    if (body.progress) {
        const progress = verify(body.progress, secret);
        if (progress?.k === 'progress' && now - progress.t < PROGRESS_TTL_MS) {
            round = progress.r;
            lives = progress.l;
        }
    }
    const pace = ROUNDS[round];
    const swapCount = body.calm ? Math.max(3, pace.swaps - 2) : pace.swaps;
    const order = shuffledOrder();
    const swaps = swapList(order, swapCount);
    const token = sign({
        k: 'round', r: round, l: lives, o: order, w: swaps, t: now, n: randomBytes(6).toString('base64url'),
    }, secret);
    return { status: 200, body: { round, lives, order, swaps, token } };
}

function pick(body, { secret, code, now }) {
    const ticket = verify(body.token, secret);
    if (ticket?.k !== 'round') return { status: 400, body: { error: 'bad-token' } };
    const age = now - ticket.t;
    if (age > ROUND_TTL_MS) return { status: 410, body: { error: 'expired' } };
    if (age < minPlayMs(ticket.r, ticket.w.length)) return { status: 429, body: { error: 'too-fast' } };
    const slot = Number(body.slot);
    if (!Number.isInteger(slot) || slot < 0 || slot > 3) return { status: 400, body: { error: 'bad-slot' } };

    const answerSlot = finalOrder(ticket.o, ticket.w).indexOf(TARGET);
    if (slot === answerSlot) {
        if (ticket.r >= LAST_ROUND) {
            return { status: 200, body: { correct: true, answerSlot, lives: ticket.l, code } };
        }
        const progress = sign({ k: 'progress', r: ticket.r + 1, l: ticket.l, t: now }, secret);
        return { status: 200, body: { correct: true, answerSlot, lives: ticket.l, progress } };
    }

    const lives = ticket.l - 1;
    if (lives <= 0) return { status: 200, body: { correct: false, answerSlot, lives: 0, over: true } };
    const progress = sign({ k: 'progress', r: ticket.r, l: lives, t: now }, secret);
    return { status: 200, body: { correct: false, answerSlot, lives, progress } };
}

export function handlePlay(body, env) {
    if (!env.secret || !env.code) return { status: 503, body: { error: 'not-configured' } };
    const input = body && typeof body === 'object' ? body : {};
    if (input.action === 'deal') return deal(input, env);
    if (input.action === 'pick') return pick(input, env);
    return { status: 400, body: { error: 'bad-action' } };
}
