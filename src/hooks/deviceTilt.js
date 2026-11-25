const listeners = new Set();
const unlockListeners = new Set();
const resetListeners = new Set();

let listening = false;
let unlocking = false;
let unlocked = false;
let usingOrientation = false;
let pose = { beta: 0, gamma: 0, ready: false };

const needsPermission = () => (
    typeof DeviceOrientationEvent !== 'undefined'
    && typeof DeviceOrientationEvent.requestPermission === 'function'
);

const publish = (beta, gamma) => {
    if (!unlocked) return;
    if (beta == null || gamma == null || Number.isNaN(beta) || Number.isNaN(gamma)) return;
    pose = { beta, gamma, ready: true };
    listeners.forEach((fn) => fn(pose));
};

const screenAngle = () => {
    const angle = screen.orientation?.angle ?? window.orientation ?? 0;
    return ((angle % 360) + 360) % 360;
};

const toScreen = (beta, gamma) => {
    switch (screenAngle()) {
    case 90:
        return { beta: gamma, gamma: -beta };
    case 270:
        return { beta: -gamma, gamma: beta };
    case 180:
        return { beta: -beta, gamma: -gamma };
    default:
        return { beta, gamma };
    }
};

const onOrientation = (event) => {
    if (event.beta == null || event.gamma == null) return;
    if (event.beta === 0 && event.gamma === 0) return;
    const screenPose = toScreen(event.beta, event.gamma);
    usingOrientation = true;
    publish(screenPose.beta, screenPose.gamma);
};

const attach = () => {
    if (listening || typeof window === 'undefined') return;
    listening = true;
    usingOrientation = false;
    window.addEventListener('deviceorientation', onOrientation);
};

const detach = () => {
    if (!listening || typeof window === 'undefined') return;
    listening = false;
    window.removeEventListener('deviceorientation', onOrientation);
};

const markUnlocked = () => {
    unlocked = true;
    usingOrientation = false;
    pose = { beta: 0, gamma: 0, ready: false };
    detach();
    attach();
    unlockListeners.forEach((fn) => fn());
};

export const isDeviceTiltUnlocked = () => unlocked;

export const listenDeviceTilt = () => {
    if (!unlocked) return;
    attach();
};

export const unlockDeviceTilt = () => {
    if (typeof window === 'undefined' || unlocked) return;

    if (!needsPermission()) {
        markUnlocked();
        return;
    }

    if (unlocking) return;
    unlocking = true;

    const orientationAsk = DeviceOrientationEvent.requestPermission();
    const motionAsk = typeof DeviceMotionEvent?.requestPermission === 'function'
        ? DeviceMotionEvent.requestPermission()
        : Promise.resolve('granted');

    Promise.all([
        orientationAsk.catch(() => 'denied'),
        motionAsk.catch(() => 'denied'),
    ]).then(([orientation, motion]) => {
        unlocking = false;
        if (orientation === 'granted' || motion === 'granted') {
            markUnlocked();
        }
    }).catch(() => {
        unlocking = false;
    });
};

export const subscribeDeviceTilt = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};

export const subscribeTiltUnlock = (fn) => {
    unlockListeners.add(fn);
    return () => unlockListeners.delete(fn);
};

export const resetDeviceTilt = () => {
    if (!unlocked) return;
    pose = { beta: 0, gamma: 0, ready: false };
    resetListeners.forEach((fn) => fn());
};

export const subscribeTiltReset = (fn) => {
    resetListeners.add(fn);
    return () => resetListeners.delete(fn);
};

export const createTiltMemory = () => ({ beta: null, gamma: null, count: 0 });

export const tiltOffset = (beta, gamma, memory) => {
    if (memory.count < 12) {
        memory.beta = ((memory.beta ?? 0) * memory.count + beta) / (memory.count + 1);
        memory.gamma = ((memory.gamma ?? 0) * memory.count + gamma) / (memory.count + 1);
        memory.count += 1;
        return null;
    }
    const x = beta - memory.beta;
    const y = gamma - memory.gamma;
    if (Math.abs(x) > 55 || Math.abs(y) > 55) {
        memory.beta = beta;
        memory.gamma = gamma;
        memory.count = 12;
        return { x: 0, y: 0 };
    }
    if (Math.abs(x) < 2 && Math.abs(y) < 2) return { x: 0, y: 0 };
    return { x, y };
};

export const bindTiltUnlock = (el) => {
    if (!el) return () => {};
    const start = () => unlockDeviceTilt();
    el.addEventListener('click', start);
    return () => el.removeEventListener('click', start);
};
