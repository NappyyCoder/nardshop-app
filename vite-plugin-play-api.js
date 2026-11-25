import { randomBytes } from 'node:crypto';
import process from 'node:process';
import { loadEnv } from 'vite';
import { handlePlay } from './server/playCore.js';

// Serves /api/play locally the way the Vercel function does in production.
export default function playApi() {
    let env = {};

    const middleware = (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/play')) {
            next();
            return;
        }
        const send = (status, body) => {
            res.statusCode = status;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify(body));
        };
        if (req.method !== 'POST') {
            send(405, { error: 'method' });
            return;
        }
        let raw = '';
        req.on('data', (chunk) => {
            raw += chunk;
            if (raw.length > 8192) req.destroy();
        });
        req.on('end', () => {
            let body = {};
            try {
                body = JSON.parse(raw || '{}');
            } catch {
                body = {};
            }
            const result = handlePlay(body, { ...env, now: Date.now() });
            send(result.status, result.body);
        });
    };

    return {
        name: 'nard-play-api',
        config(_, { mode }) {
            const vars = loadEnv(mode, process.cwd(), '');
            env = {
                secret: vars.GAME_SECRET || randomBytes(24).toString('hex'),
                code: vars.NARD_COUPON_CODE || 'LOCAL-TEST',
            };
        },
        configureServer(server) {
            server.middlewares.use(middleware);
        },
        configurePreviewServer(server) {
            server.middlewares.use(middleware);
        },
    };
}
