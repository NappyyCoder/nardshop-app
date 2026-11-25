import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import catSrc from '../assets/nard-cat.png';
import markSrc from '../assets/nard-face-yellow.png';
import nathanSrc from '../assets/twins/nard-nathan-649.jpg';
import leonardSrc from '../assets/twins/nard-leonard-623.jpg';

const YELLOW = 0xffd400;
const SILVER = 0xe8e8ec;
const KNOB = 0xf3f3f3;
const SIZE = 1.28;

const SKINS = {
    yellow: {
        body: YELLOW,
        outline: null,
        sideBg: '#ffd400',
        sideInk: '#111111',
        knob: KNOB,
        metal: SILVER,
        badge: 'dark',
    },
    white: {
        body: 0xffffff,
        outline: 0x050505,
        sideBg: '#ffffff',
        sideInk: '#050505',
        knob: 0x111111,
        metal: 0xffffff,
        badge: 'dark',
    },
    black: {
        body: 0x0a0a0a,
        outline: 0xffffff,
        sideBg: '#0a0a0a',
        sideInk: '#ffffff',
        knob: 0xffffff,
        metal: 0xf4f4f4,
        badge: 'light',
    },
};
export const TV_CHANNELS = [
    { id: 'cat', ch: '23', label: 'NARD' },
    { id: 'soon', ch: '24', label: 'SOON' },
    { id: 'nathan', ch: '25', label: 'NATHAN' },
    { id: 'leonard', ch: '26', label: 'LEONARD' },
];

const SCREEN = 0.92;
const SCREEN_PX = 256;
const IDLE_FRAMES = 12;
const STORM_FRAMES = 6;

const clipRoundRect = (ctx, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(width - r, 0);
    ctx.quadraticCurveTo(width, 0, width, r);
    ctx.lineTo(width, height - r);
    ctx.quadraticCurveTo(width, height, width - r, height);
    ctx.lineTo(r, height);
    ctx.quadraticCurveTo(0, height, 0, height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
};

const makeNoise = (size, storm) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(size, size);
    const { data } = image;
    for (let i = 0; i < data.length; i += 4) {
        const n = storm ? 40 + Math.random() * 215 : 28 + Math.random() * 150;
        data[i] = n;
        data[i + 1] = n;
        data[i + 2] = Math.round(n * 0.97);
        data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
};

const loadImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
});

const drawCover = (ctx, img, size) => {
    const scale = Math.max(size / img.width, size / img.height);
    const width = img.width * scale;
    const height = img.height * scale;
    ctx.drawImage(img, (size - width) / 2, (size - height) / 2 - size * 0.08, width, height);
};

const loadMark = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = image;
        const isPaper = (index) => (
            data[index] > 220 && data[index + 1] > 220 && data[index + 2] > 220
        );
        const seen = new Uint8Array(width * height);
        const stack = [0, width - 1, (height - 1) * width, height * width - 1];
        while (stack.length) {
            const pixel = stack.pop();
            if (pixel < 0 || pixel >= seen.length || seen[pixel]) continue;
            seen[pixel] = 1;
            const index = pixel * 4;
            if (!isPaper(index)) continue;
            data[index + 3] = 0;
            const x = pixel % width;
            const y = (pixel - x) / width;
            if (x > 0) stack.push(pixel - 1);
            if (x < width - 1) stack.push(pixel + 1);
            if (y > 0) stack.push(pixel - width);
            if (y < height - 1) stack.push(pixel + width);
        }
        const face = new Uint8Array(width * height);
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 0) continue;
            if (data[i] > 180 && data[i + 1] > 140 && data[i + 2] < 90) {
                face[i / 4] = 1;
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
            }
        }
        const reach = Math.max(3, Math.round(width / 80));
        const spread = (src, step, span, count) => {
            const out = new Uint8Array(src.length);
            for (let line = 0; line < count; line += 1) {
                const base = step === 1 ? line * span : line;
                const stride = step === 1 ? 1 : width;
                let last = -Infinity;
                for (let k = 0; k < span; k += 1) {
                    if (src[base + k * stride]) last = k;
                    if (k - last <= reach) out[base + k * stride] = 1;
                }
                last = Infinity;
                for (let k = span - 1; k >= 0; k -= 1) {
                    if (src[base + k * stride]) last = k;
                    if (last - k <= reach) out[base + k * stride] = 1;
                }
            }
            return out;
        };
        const grown = spread(spread(face, 1, width, height), width, height, width);
        const outside = new Uint8Array(width * height);
        const walk = [];
        for (let x = 0; x < width; x += 1) walk.push(x, (height - 1) * width + x);
        for (let y = 0; y < height; y += 1) walk.push(y * width, y * width + width - 1);
        while (walk.length) {
            const pixel = walk.pop();
            if (outside[pixel] || grown[pixel]) continue;
            outside[pixel] = 1;
            const x = pixel % width;
            if (x > 0) walk.push(pixel - 1);
            if (x < width - 1) walk.push(pixel + 1);
            if (pixel >= width) walk.push(pixel - width);
            if (pixel < (height - 1) * width) walk.push(pixel + width);
        }
        ctx.putImageData(image, 0, 0);
        const lightImage = ctx.createImageData(width, height);
        lightImage.data.set(data);
        for (let pixel = 0; pixel < outside.length; pixel += 1) {
            if (!outside[pixel]) continue;
            const index = pixel * 4;
            lightImage.data[index] = 255;
            lightImage.data[index + 1] = 255;
            lightImage.data[index + 2] = 255;
        }
        const lightCanvas = document.createElement('canvas');
        lightCanvas.width = width;
        lightCanvas.height = height;
        lightCanvas.getContext('2d').putImageData(lightImage, 0, 0);
        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                if (data[(y * width + x) * 4 + 3] === 0) continue;
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
        const pad = 2;
        const cropX = Math.max(0, minX - pad);
        const cropY = Math.max(0, minY - pad);
        const cropW = Math.min(width - cropX, maxX - minX + 1 + pad * 2);
        const cropH = Math.min(height - cropY, maxY - minY + 1 + pad * 2);
        const crop = (source) => {
            const cropped = document.createElement('canvas');
            cropped.width = cropW;
            cropped.height = cropH;
            cropped.getContext('2d').drawImage(source, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            return cropped;
        };
        resolve({ dark: crop(canvas), light: crop(lightCanvas) });
    };
    img.onerror = reject;
    img.src = url;
});

const loadCat = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = image;
        for (let i = 0; i < data.length; i += 4) {
            const bright = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (bright > 190) {
                data[i + 3] = 0;
            } else {
                data[i] = 245;
                data[i + 1] = 245;
                data[i + 2] = 245;
                data[i + 3] = 255;
            }
        }
        ctx.putImageData(image, 0, 0);
        resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
});

const sideLines = (text) => {
    if (text === 'WHEREVER LIFE TAKES YOU') {
        return ['WHEREVER', 'LIFE TAKES', 'YOU'];
    }
    if (text === 'NARDSHOP.COM') {
        return ['NARD', 'SHOP', '.COM'];
    }
    if (text === 'INSTAGRAM') {
        return ['INSTA', 'GRAM'];
    }
    if (text === 'TIK TOK') {
        return ['TIK', 'TOK'];
    }
    return [text];
};

let sharedArt = null;
const loadSharedArt = () => {
    if (!sharedArt) {
        sharedArt = Promise.all([
            loadCat(catSrc),
            loadMark(markSrc),
            loadImage(nathanSrc),
            loadImage(leonardSrc),
        ]);
    }
    return sharedArt;
};

const makeSideLabel = async (text, bg = '#ffd400', ink = '#111') => {
    if (document.fonts?.load) {
        await document.fonts.load('120px "Jockey One"').catch(() => {});
    } else if (document.fonts?.ready) {
        await document.fonts.ready.catch(() => {});
    }
    const width = 1024;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    const lines = sideLines(text);
    const maxW = width - 64;
    const maxH = height - 80;
    const setFont = (px) => {
        ctx.font = `${px}px "Jockey One", sans-serif`;
    };
    const fits = (px) => {
        setFont(px);
        const lineH = px * 0.9;
        if (lines.length * lineH > maxH) return false;
        return lines.every((line) => ctx.measureText(line).width <= maxW);
    };
    let low = 24;
    let high = 420;
    let best = 24;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (fits(mid)) {
            best = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    setFont(best);
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lineH = best * 0.9;
    const block = lineH * lines.length;
    const startY = height / 2 - block / 2 + lineH / 2;
    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineH);
    });
    return canvas;
};

const addOutline = (mesh, color, disposers) => {
    if (color == null) return;
    const edges = new THREE.EdgesGeometry(mesh.geometry, 22);
    const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color }),
    );
    mesh.add(line);
    disposers.push(edges, line.material);
};

const drawInstagramLogo = (ctx, size) => {
    const x = size * 0.2;
    const y = size * 0.18;
    const w = size * 0.6;
    const r = w * 0.24;
    ctx.save();
    ctx.strokeStyle = '#ffd400';
    ctx.lineWidth = size * 0.042;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + w - r);
    ctx.quadraticCurveTo(x + w, y + w, x + w - r, y + w);
    ctx.lineTo(x + r, y + w);
    ctx.quadraticCurveTo(x, y + w, x, y + w - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.48, w * 0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.655, size * 0.345, w * 0.042, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd400';
    ctx.fill();
    ctx.restore();
};

const TIKTOK_PATH = 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z';

const drawTikTokLogo = (ctx, size) => {
    ctx.save();
    const scale = (size * 0.6) / 24;
    ctx.translate((size - 24 * scale) / 2, (size - 24 * scale) / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffd400';
    ctx.fill(new Path2D(TIKTOK_PATH));
    ctx.restore();
};

export { TIKTOK_PATH };

export const createCatCube = async (skinName = 'yellow', options = {}) => {
    const skin = SKINS[skinName] || SKINS.yellow;
    const logo = options.logo || null;
    const SCREEN_PX = options.lite ? 160 : 256;
    const idleCount = options.lite ? 4 : IDLE_FRAMES;
    const stormCount = options.lite ? 3 : STORM_FRAMES;
    const screenSkip = options.lite ? 8 : 4;
    const group = new THREE.Group();
    const disposers = [];

    const plastic = new THREE.MeshBasicMaterial({ color: skin.body });
    const metal = new THREE.MeshBasicMaterial({ color: skin.metal });
    const knobMat = new THREE.MeshBasicMaterial({ color: skin.knob });
    disposers.push(plastic, metal, knobMat);

    const bodyGeo = new RoundedBoxGeometry(SIZE, SIZE, SIZE, 5, 0.042);
    const body = new THREE.Mesh(bodyGeo, plastic);
    if (skin.outline != null) {
        const shellGeo = new RoundedBoxGeometry(SIZE * 1.05, SIZE * 1.05, SIZE * 1.05, 5, 0.05);
        const shellMat = new THREE.MeshBasicMaterial({
            color: skin.outline,
            side: THREE.BackSide,
        });
        group.add(new THREE.Mesh(shellGeo, shellMat));
        disposers.push(shellGeo, shellMat);
    }
    group.add(body);
    addOutline(body, skin.outline, disposers);
    disposers.push(bodyGeo);

    const [cat, mark, nathanPhoto, leonardPhoto] = await loadSharedArt();
    const leftText = logo === 'instagram' ? 'INSTAGRAM' : logo === 'tiktok' ? 'TIK TOK' : 'NARDSHOP.COM';
    const rightText = 'WHEREVER LIFE TAKES YOU';
    const [leftArt, rightArt] = await Promise.all([
        makeSideLabel(leftText, skin.sideBg, skin.sideInk),
        makeSideLabel(rightText, skin.sideBg, skin.sideInk),
    ]);
    const badgeArt = skin.badge === 'light' ? mark.light : mark.dark;
    const idleNoise = Array.from({ length: idleCount }, () => makeNoise(SCREEN_PX, false));
    const stormNoise = Array.from({ length: stormCount }, () => makeNoise(SCREEN_PX, true));

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = SCREEN_PX;
    screenCanvas.height = SCREEN_PX;
    const screenCtx = screenCanvas.getContext('2d');
    const screenMap = new THREE.CanvasTexture(screenCanvas);
    screenMap.colorSpace = THREE.SRGBColorSpace;
    screenMap.minFilter = THREE.LinearFilter;
    screenMap.magFilter = THREE.NearestFilter;
    const screenMat = new THREE.MeshBasicMaterial({
        map: screenMap,
        transparent: true,
    });
    disposers.push(screenMap, screenMat);

    const glassGeo = new THREE.PlaneGeometry(SCREEN, SCREEN);
    const glass = new THREE.Mesh(glassGeo, screenMat);
    glass.position.z = SIZE / 2 + 0.004;
    group.add(glass);
    addOutline(glass, skin.outline, disposers);
    disposers.push(glassGeo);

    const leftMap = new THREE.CanvasTexture(leftArt);
    const rightMap = new THREE.CanvasTexture(rightArt);
    leftMap.colorSpace = THREE.SRGBColorSpace;
    rightMap.colorSpace = THREE.SRGBColorSpace;
    const leftMat = new THREE.MeshBasicMaterial({ map: leftMap });
    const rightMat = new THREE.MeshBasicMaterial({ map: rightMap });
    const sideGeo = new THREE.PlaneGeometry(SIZE * 0.9, SIZE * 0.9);
    const sideL = new THREE.Mesh(sideGeo, leftMat);
    const sideR = new THREE.Mesh(sideGeo, rightMat);
    sideL.position.set(-(SIZE / 2 + 0.003), 0, 0);
    sideR.position.set(SIZE / 2 + 0.003, 0, 0);
    sideL.rotation.y = -Math.PI / 2;
    sideR.rotation.y = Math.PI / 2;
    group.add(sideL, sideR);
    disposers.push(leftMap, rightMap, leftMat, rightMat, sideGeo);

    let knob = null;
    if (logo) {
        const knobGeo = new THREE.SphereGeometry(0.028, 12, 10);
        knob = new THREE.Mesh(knobGeo, knobMat);
        knob.position.set(SIZE / 2 - 0.1, -SIZE / 2 + 0.1, SIZE / 2 + 0.002);
        group.add(knob);
        addOutline(knob, skin.outline, disposers);
        disposers.push(knobGeo);
    }

    const markMap = new THREE.CanvasTexture(badgeArt);
    markMap.colorSpace = THREE.SRGBColorSpace;
    markMap.minFilter = THREE.LinearFilter;
    const markMat = new THREE.MeshBasicMaterial({
        map: markMap,
        transparent: true,
        depthWrite: false,
    });
    const markW = 0.092;
    const markH = markW * (badgeArt.height / badgeArt.width);
    const markGeo = new THREE.PlaneGeometry(markW, markH);
    const badge = new THREE.Mesh(markGeo, markMat);
    badge.position.set(0, SIZE / 2 - 0.114, SIZE / 2 + 0.008);
    group.add(badge);
    disposers.push(markMap, markMat, markGeo);

    const rodGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.7, 7);
    const rodL = new THREE.Mesh(rodGeo, metal);
    const rodR = new THREE.Mesh(rodGeo, metal);
    rodL.position.set(-0.18, SIZE / 2 + 0.34, 0);
    rodR.position.set(0.18, SIZE / 2 + 0.34, 0);
    rodL.rotation.z = 0.46;
    rodR.rotation.z = -0.46;
    group.add(rodL, rodR);
    disposers.push(rodGeo);

    const jointGeo = new THREE.SphereGeometry(0.028, 12, 10);
    const joint = new THREE.Mesh(jointGeo, metal);
    joint.position.set(0, SIZE / 2 + 0.01, 0);
    group.add(joint);
    addOutline(joint, skin.outline, disposers);
    disposers.push(jointGeo);

    const boltCanvas = document.createElement('canvas');
    boltCanvas.width = 256;
    boltCanvas.height = 192;
    const boltCtx = boltCanvas.getContext('2d');
    const boltMap = new THREE.CanvasTexture(boltCanvas);
    boltMap.colorSpace = THREE.SRGBColorSpace;
    boltMap.minFilter = THREE.LinearFilter;
    boltMap.magFilter = THREE.LinearFilter;
    const boltMat = new THREE.SpriteMaterial({
        map: boltMap,
        transparent: true,
        depthTest: false,
        depthWrite: false,
    });
    const bolt = new THREE.Sprite(boltMat);
    bolt.position.set(0, SIZE / 2 + 0.34, 0.16);
    bolt.scale.set(0.72, 0.5, 1);
    bolt.renderOrder = 20;
    bolt.visible = false;
    group.add(bolt);
    disposers.push(boltMap, boltMat);

    const sparkGeo = new THREE.SphereGeometry(0.018, 8, 8);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfff6c4 });
    const sparkL = new THREE.Mesh(sparkGeo, sparkMat);
    const sparkR = new THREE.Mesh(sparkGeo, sparkMat);
    sparkL.visible = false;
    sparkR.visible = false;
    group.add(sparkL, sparkR);
    disposers.push(sparkGeo, sparkMat);

    const paintBolt = () => {
        const { width: w, height: h } = boltCanvas;
        boltCtx.clearRect(0, 0, w, h);
        const bolts = 2 + (Math.random() < 0.45 ? 1 : 0);
        for (let b = 0; b < bolts; b += 1) {
            const points = [];
            const segs = 7;
            const lift = (Math.random() - 0.5) * 36;
            for (let i = 0; i <= segs; i += 1) {
                const t = i / segs;
                points.push({
                    x: 18 + t * (w - 36) + (Math.random() - 0.5) * 22,
                    y: h * 0.5 + lift + (Math.random() - 0.5) * h * 0.42,
                });
            }
            boltCtx.lineJoin = 'miter';
            boltCtx.lineCap = 'round';
            boltCtx.beginPath();
            points.forEach((point, index) => {
                if (index) boltCtx.lineTo(point.x, point.y);
                else boltCtx.moveTo(point.x, point.y);
            });
            boltCtx.strokeStyle = 'rgba(255, 212, 0, 0.28)';
            boltCtx.lineWidth = 22;
            boltCtx.stroke();
            boltCtx.strokeStyle = '#ffd400';
            boltCtx.lineWidth = 8;
            boltCtx.stroke();
            boltCtx.strokeStyle = '#fffce8';
            boltCtx.lineWidth = 3;
            boltCtx.stroke();
        }
        boltMap.needsUpdate = true;
        bolt.visible = true;

        const tip = SIZE / 2 + 0.62;
        sparkL.position.set(-0.38, tip, 0.04);
        sparkR.position.set(0.38, tip, 0.04);
        const sparkOn = Math.random() > 0.2;
        sparkL.visible = sparkOn;
        sparkR.visible = sparkOn;
    };

    const hideBolt = () => {
        bolt.visible = false;
        sparkL.visible = false;
        sparkR.visible = false;
    };

    group.position.y = 0.02;

    const listed = Object.fromEntries(TV_CHANNELS.map((item) => [item.id, item]));
    const STATIONS = [
        { ...listed.cat },
        { ...listed.soon, title: 'THE SIGNAL ARRIVES SOON' },
        { ...listed.nathan, name: 'NATHAN', title: 'GRAPHIC DESIGNER', photo: nathanPhoto, mark: 'NA', markAt: 'start' },
        { ...listed.leonard, name: 'LEONARD', title: 'WEB DEVELOPER', photo: leonardPhoto, mark: 'RD', markAt: 'end' },
        { id: 'on', ch: '00', label: "YOU'RE ON", title: "YOU'RE ON" },
    ];
    const PUBLIC = STATIONS.filter((item) => item.id !== 'on');
    const rodBase = { left: 0.46, right: -0.46 };
    let frames = 0;
    let stormUntil = 0;
    let channelIndex = 0;
    let station = STATIONS[0];
    const dialRadius = 0.24;
    const dial = new THREE.Group();
    const dialTargets = [];
    const raycaster = new THREE.Raycaster();
    let paintDial = () => {};
    let pointKnob = () => {};
    let knobRig = null;
    let inviteRing = null;
    let knobAngle = 0;
    let knobTarget = 0;
    let pressed = 0;
    let invite = !logo;

    if (!logo) {
        const dialScale = 0.38;
        const visualRadius = dialRadius * dialScale;
        dial.scale.setScalar(dialScale);
        dial.position.set(
            SIZE / 2 - visualRadius - 0.045,
            -SIZE / 2 + visualRadius + 0.045,
            SIZE / 2 + 0.016,
        );
        group.add(dial);

        const dialPx = 512;
        const dialCanvas = document.createElement('canvas');
        dialCanvas.width = dialPx;
        dialCanvas.height = dialPx;
        const dialCtx = dialCanvas.getContext('2d');
        const dialMap = new THREE.CanvasTexture(dialCanvas);
        dialMap.colorSpace = THREE.SRGBColorSpace;
        dialMap.minFilter = THREE.LinearFilter;
        dialMap.magFilter = THREE.LinearFilter;
        const plateGeo = new THREE.CircleGeometry(dialRadius, 48);
        const plateMat = new THREE.MeshBasicMaterial({ map: dialMap });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        dial.add(plate);
        dialTargets.push(plate);
        disposers.push(dialMap, plateMat, plateGeo);

        const ringGeo = new THREE.RingGeometry(dialRadius * 0.78, dialRadius * 0.9, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: YELLOW, side: THREE.DoubleSide });
        inviteRing = new THREE.Mesh(ringGeo, ringMat);
        inviteRing.position.z = 0.004;
        dial.add(inviteRing);
        disposers.push(ringGeo, ringMat);

        knobRig = new THREE.Group();
        knobRig.position.z = 0.05;
        const capGeo = new THREE.CylinderGeometry(dialRadius * 0.28, dialRadius * 0.31, 0.055, 24);
        const cap = new THREE.Mesh(capGeo, knobMat);
        cap.rotation.x = Math.PI / 2;
        knobRig.add(cap);
        const notchLen = dialRadius * 0.46;
        const notchGeo = new THREE.BoxGeometry(0.018, notchLen, 0.014);
        const notchMat = new THREE.MeshBasicMaterial({ color: YELLOW });
        const notch = new THREE.Mesh(notchGeo, notchMat);
        notch.position.set(0, dialRadius * 0.18, 0.036);
        knobRig.add(notch);
        dial.add(knobRig);
        dialTargets.push(cap, notch);
        disposers.push(capGeo, notchGeo, notchMat);

        paintDial = () => {
            const ctx = dialCtx;
            const px = dialPx;
            ctx.clearRect(0, 0, px, px);
            ctx.beginPath();
            ctx.arc(px / 2, px / 2, px / 2 - 3, 0, Math.PI * 2);
            ctx.fillStyle = '#101010';
            ctx.fill();
            ctx.lineWidth = 10;
            ctx.strokeStyle = '#ffd400';
            ctx.stroke();
            TV_CHANNELS.forEach((channel, index) => {
                const on = station.id === channel.id;
                const theta = index * (Math.PI / 2);
                const reach = px * 0.33;
                const x = px / 2 + Math.sin(theta) * reach;
                const y = px / 2 - Math.cos(theta) * reach;
                ctx.fillStyle = on ? '#ffd400' : '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `700 ${on ? 54 : 40}px "Jockey One", sans-serif`;
                ctx.fillText(channel.ch, x, y - (on ? 16 : 0));
                if (on) {
                    ctx.font = '700 22px "Jockey One", sans-serif';
                    ctx.fillText(channel.label, x, y + 22);
                }
            });
            dialMap.needsUpdate = true;
        };

        pointKnob = (index) => {
            if (index < 0) return;
            let target = -index * (Math.PI / 2);
            while (target > knobAngle - 0.001) target -= Math.PI * 2;
            knobTarget = target;
        };

        paintDial();
    }

    const drawTitle = (alpha) => {
        if (!station.title || station.photo) return;
        screenCtx.globalAlpha = alpha;
        screenCtx.fillStyle = '#ffd400';
        screenCtx.textAlign = 'center';
        screenCtx.textBaseline = 'middle';
        screenCtx.font = '700 20px "Jockey One", sans-serif';
        screenCtx.fillText(`CH ${station.ch}`, SCREEN_PX / 2, SCREEN_PX * 0.28);
        const lines = station.title === 'THE SIGNAL ARRIVES SOON'
            ? ['THE SIGNAL', 'ARRIVES SOON']
            : [station.title];
        screenCtx.font = `700 ${lines.length > 1 ? 28 : 32}px "Jockey One", sans-serif`;
        lines.forEach((line, index) => {
            screenCtx.fillText(line, SCREEN_PX / 2, SCREEN_PX * 0.46 + index * 34);
        });
        screenCtx.globalAlpha = 1;
    };

    const drawTwin = (alpha) => {
        if (!station.photo) return;
        screenCtx.globalAlpha = alpha;
        drawCover(screenCtx, station.photo, SCREEN_PX);
        const fade = screenCtx.createLinearGradient(0, SCREEN_PX * 0.58, 0, SCREEN_PX);
        fade.addColorStop(0, 'rgba(0,0,0,0)');
        fade.addColorStop(0.45, 'rgba(0,0,0,0.55)');
        fade.addColorStop(1, 'rgba(0,0,0,0.88)');
        screenCtx.fillStyle = fade;
        screenCtx.fillRect(0, SCREEN_PX * 0.55, SCREEN_PX, SCREEN_PX * 0.45);
        screenCtx.textAlign = 'center';
        screenCtx.textBaseline = 'middle';
        screenCtx.fillStyle = '#ffd400';
        screenCtx.font = '700 15px "Jockey One", sans-serif';
        screenCtx.fillText(`CH ${station.ch}`, SCREEN_PX / 2, SCREEN_PX * 0.7);
        screenCtx.font = '700 26px "Jockey One", sans-serif';
        screenCtx.textAlign = 'left';
        const mark = station.mark || '';
        const rest = station.markAt === 'end'
            ? station.name.slice(0, -mark.length)
            : station.name.slice(mark.length);
        const markText = station.markAt === 'end'
            ? station.name.slice(-mark.length)
            : mark;
        const leftText = station.markAt === 'end' ? rest : markText;
        const rightText = station.markAt === 'end' ? markText : rest;
        const leftColor = station.markAt === 'end' ? '#fff' : '#ffd400';
        const rightColor = station.markAt === 'end' ? '#ffd400' : '#fff';
        const leftW = screenCtx.measureText(leftText).width;
        const rightW = screenCtx.measureText(rightText).width;
        let nx = SCREEN_PX / 2 - (leftW + rightW) / 2;
        const nameY = SCREEN_PX * 0.8;
        screenCtx.fillStyle = leftColor;
        screenCtx.fillText(leftText, nx, nameY);
        nx += leftW;
        screenCtx.fillStyle = rightColor;
        screenCtx.fillText(rightText, nx, nameY);
        screenCtx.textAlign = 'center';
        screenCtx.fillStyle = '#ffd400';
        screenCtx.font = '700 14px "Jockey One", sans-serif';
        screenCtx.fillText(station.title, SCREEN_PX / 2, SCREEN_PX * 0.9);
        screenCtx.globalAlpha = 1;
    };

    const drawTapPrompt = () => {
        const fade = screenCtx.createLinearGradient(0, SCREEN_PX * 0.62, 0, SCREEN_PX);
        fade.addColorStop(0, 'rgba(0,0,0,0)');
        fade.addColorStop(0.5, 'rgba(0,0,0,0.55)');
        fade.addColorStop(1, 'rgba(0,0,0,0.84)');
        screenCtx.fillStyle = fade;
        screenCtx.fillRect(0, SCREEN_PX * 0.6, SCREEN_PX, SCREEN_PX * 0.4);
        screenCtx.textAlign = 'center';
        screenCtx.textBaseline = 'middle';
        screenCtx.fillStyle = '#ffd400';
        screenCtx.font = `700 ${Math.round(SCREEN_PX * 0.078)}px "Jockey One", sans-serif`;
        screenCtx.fillText('TAP THE SCREEN', SCREEN_PX / 2, SCREEN_PX * 0.78);
        screenCtx.fillStyle = '#ffffff';
        screenCtx.font = `700 ${Math.round(SCREEN_PX * 0.058)}px "Jockey One", sans-serif`;
        screenCtx.fillText('TO CHANGE THE CHANNEL', SCREEN_PX / 2, SCREEN_PX * 0.89);
    };

    const paintScreen = (storm) => {
        screenCtx.clearRect(0, 0, SCREEN_PX, SCREEN_PX);
        screenCtx.save();
        clipRoundRect(screenCtx, SCREEN_PX, SCREEN_PX, SCREEN_PX * 0.08);
        const sheet = storm
            ? stormNoise[frames % stormNoise.length]
            : idleNoise[frames % idleNoise.length];
        screenCtx.drawImage(sheet, 0, 0, SCREEN_PX, SCREEN_PX);

        if (logo) {
            if (Math.random() > 0.08) {
                if (logo === 'tiktok') drawTikTokLogo(screenCtx, SCREEN_PX);
                else drawInstagramLogo(screenCtx, SCREEN_PX);
            }
        } else if (!storm && station.id === 'cat' && cat) {
            const dropout = Math.random() < 0.16;
            if (!dropout) {
                screenCtx.globalAlpha = 0.42 + Math.random() * 0.58;
                const catW = SCREEN_PX * 0.62;
                const catH = catW * (cat.height / cat.width);
                screenCtx.drawImage(
                    cat,
                    (SCREEN_PX - catW) / 2,
                    (SCREEN_PX - catH) / 2 - SCREEN_PX * 0.06,
                    catW,
                    catH,
                );
                screenCtx.globalAlpha = 1;
            }
        }

        if (!logo && !storm && station.photo && Math.random() > 0.05) {
            drawTwin(0.86 + Math.random() * 0.14);
        } else if (!logo && !storm && station.title && !station.photo && Math.random() > 0.04) {
            drawTitle(0.82 + Math.random() * 0.18);
        } else if (!logo && !storm && station.id === 'cat') {
            drawTapPrompt();
        }

        screenCtx.restore();
        screenMap.needsUpdate = true;
    };

    paintScreen(false);

    const refreshScreen = (force = false) => {
        frames += 1;
        const now = performance.now();
        const storm = now < stormUntil;
        if (storm) {
            const shake = Math.sin(now / 18) * 0.08;
            rodL.rotation.z = rodBase.left + shake;
            rodR.rotation.z = rodBase.right - shake;
            if (frames % 2 === 0) paintBolt();
        } else {
            hideBolt();
            if (rodL.rotation.z !== rodBase.left) {
                rodL.rotation.z = rodBase.left;
                rodR.rotation.z = rodBase.right;
            }
        }
        if (knobRig) {
            knobAngle += (knobTarget - knobAngle) * 0.22;
            knobRig.rotation.z = knobAngle;
            pressed += (0 - pressed) * 0.2;
            knobRig.position.z = 0.05 - pressed * 0.028;
            if (inviteRing) {
                if (invite) {
                    const pulse = 1 + Math.sin(now / 260) * 0.05;
                    inviteRing.scale.set(pulse, pulse, 1);
                } else if (inviteRing.scale.x !== 1) {
                    inviteRing.scale.set(1, 1, 1);
                }
            }
        }
        if (!force && frames % screenSkip !== 0) return;
        paintScreen(storm);
    };

    const tuneTo = (next) => {
        if (!next) return;
        station = next;
        if (logo && knob) knob.rotation.z += 0.85;
        if (!logo) {
            pressed = 1;
            invite = false;
            pointKnob(PUBLIC.findIndex((item) => item.id === station.id));
            paintDial();
        }
        stormUntil = performance.now() + 720;
        paintBolt();
        refreshScreen(true);
    };

    const pickDial = (ndc, camera) => {
        if (!dialTargets.length) return null;
        dial.updateWorldMatrix(true, true);
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(dialTargets, false);
        if (!hits.length) return null;
        const hit = hits[0];
        if (hit.object === dialTargets[0]) {
            const local = dial.worldToLocal(hit.point.clone());
            if (Math.hypot(local.x, local.y) >= dialRadius * 0.46) {
                const theta = Math.atan2(local.x, local.y);
                let index = Math.round(theta / (Math.PI / 2));
                index = ((index % 4) + 4) % 4;
                const channel = TV_CHANNELS[index];
                if (channel) return { action: 'tune', id: channel.id };
            }
        }
        return { action: 'next' };
    };

    const zap = () => {
        channelIndex = (channelIndex + 1) % PUBLIC.length;
        tuneTo(PUBLIC[channelIndex]);
    };

    const tune = (id) => {
        const next = STATIONS.find((item) => item.id === id);
        if (!next || next.id === station.id) return;
        const publicIndex = PUBLIC.findIndex((item) => item.id === id);
        if (publicIndex >= 0) channelIndex = publicIndex;
        tuneTo(next);
    };

    return {
        group,
        refreshScreen,
        zap,
        tune,
        pickDial,
        dispose: () => disposers.forEach((item) => item.dispose?.()),
    };
};
