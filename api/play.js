import process from 'node:process';
import { handlePlay } from '../server/playCore.js';

function readBody(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch {
            return {};
        }
    }
    return {};
}

export default function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ error: 'method' });
        return;
    }
    const result = handlePlay(readBody(req), {
        secret: process.env.GAME_SECRET,
        code: process.env.NARD_COUPON_CODE,
        now: Date.now(),
    });
    res.status(result.status).json(result.body);
}
