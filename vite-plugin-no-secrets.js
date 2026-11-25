import { loadEnv } from 'vite';

// Anything named VITE_* is copied into the public browser bundle.
const SECRET_NAME = /SECRET|PASSWORD|PRIVATE|CONSUMER|TOKEN|API_KEY/i;
const SECRET_SHAPE = /\b(?:ck|cs)_[a-f0-9]{40}\b|\bsk_live_[0-9a-zA-Z]{10,}|\bpk_[a-zA-Z0-9]{16,}/;

export default function noSecrets() {
  return {
    name: 'nard-no-secrets',
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), 'VITE_');
      const risky = Object.keys(env).filter((key) => SECRET_NAME.test(key));
      if (risky.length) {
        throw new Error(
          `Stopped: ${risky.join(', ')} would be published to every visitor's browser. `
          + 'Remove it from .env, or rename it without the VITE_ prefix and use it only on a server.',
        );
      }
    },
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        const text = file.type === 'chunk' ? file.code : typeof file.source === 'string' ? file.source : '';
        if (SECRET_SHAPE.test(text)) {
          this.error(`Stopped: something that looks like an API key is in ${file.fileName}. Nothing was published.`);
        }
      }
    },
  };
}
