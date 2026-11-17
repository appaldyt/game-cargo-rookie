import * as THREE from '/vendor/three.module.min.js';
import { PORT, NPC, BRIEF, BRIEF_Q, SARI, SORT, DIR, MAN, DINA, DINA2, BIMA, QUIZ, INFO } from './content.js';

/* ================= PENGATURAN ================= */
const QUIZ_N = 8, QUIZ_TIME = 20, SORT_N = 12, MAN_N = 6, SPEED = 5.2, RES = 0.75;
const BADGES = [{ ab: 'BR', c: '#ffd23f' }, { ab: 'SO', c: '#f2a541' }, { ab: 'DR', c: '#6cc070' }, { ab: 'DS', c: '#4fa3d9' }];

/* ================= UTIL ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
const cleanEv = s => String(s || '').toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24);
const fmt = n => Number(n).toLocaleString('id-ID');
const wait = ms => new Promise(r => setTimeout(r, ms));
let toastT; function toast(m, bad) { const t = $('#toast'); t.textContent = m; t.className = 'on' + (bad ? ' bad' : ''); clearTimeout(toastT); toastT = setTimeout(() => t.className = '', 1300); }

/* ================= STATE ================= */
const G = { mode: 'title', lock: 0, stage: 0, badges: [0, 0, 0, 0], score: 0, z: [0, 0, 0, 0], right: 0, total: 0, cards: new Set(), met: new Set(),
  man: [], mi: 0, tries: 0, P: {}, id: '', t0: 0, target: null, aAct: null, aOverride: null };

/* ================= RENDERER & SCENE ================= */
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#9cc9d6');
scene.fog = new THREE.Fog('#9cc9d6', 45, 95);
const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 220);
scene.add(new THREE.HemisphereLight('#fff6e0', '#4f5d55', 1.25));
const sun = new THREE.DirectionalLight('#ffffff', 1.5); sun.position.set(12, 25, 10); scene.add(sun);
function resize() { renderer.setPixelRatio(RES); renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.fov = cam.aspect < 0.8 ? 50 : 40; cam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const mats = {}, geos = {}, colliders = [];
const mat = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c, flatShading: true }));
const geo = (w, h, d) => { const k = w + '|' + h + '|' + d; return geos[k] || (geos[k] = new THREE.BoxGeometry(w, h, d)); };
function solid(x, z, w, d) { colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 }); }
// Kotak dengan alas di ketinggian y
function B(w, h, d, c, x, y, z, par = scene, col = false) { const m = new THREE.Mesh(geo(w, h, d), typeof c === 'string' ? mat(c) : c); m.position.set(x, y + h / 2, z); par.add(m); if (col) solid(x, z, w, d); return m; }
function textTex(lines, bg, fg, W, H, size) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, W, H); }
  x.textAlign = 'center'; x.textBaseline = 'middle';
  const ls = [].concat(lines);
  let s = size;
  x.font = `${s}px "Press Start 2P", monospace`;
  const pad = 12;
  let maxW = 0;
  for (const l of ls) {
    const txt = typeof l === 'object' ? l.text : l;
    const w = x.measureText(txt).width;
    if (w > maxW) maxW = w;
  }
  if (maxW > W - pad && maxW > 0) {
    s = Math.max(8, Math.floor(s * (W - pad) / maxW));
    x.font = `${s}px "Press Start 2P", monospace`;
  }
  ls.forEach((l, i) => {
    const txt = typeof l === 'object' ? l.text : l;
    x.fillStyle = (typeof l === 'object' && l.color) ? l.color : fg;
    x.fillText(txt, W / 2, H / 2 + (i - (ls.length - 1) / 2) * s * 1.35);
  });
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; t.colorSpace = THREE.SRGBColorSpace; return t;
}
function sign(text, bg, fg, w, h, x, y, z, ry = 0, size = 20) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: textTex(text, bg, fg, Math.round(w * 48), Math.round(h * 48), size), transparent: !bg }));
  m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); return m;
}
function sprite(text, bg, fg, w, h, size = 18) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTex(text, bg, fg, Math.round(w * 64), Math.round(h * 64), size), depthTest: false }));
  s.scale.set(w, h, 1); s.renderOrder = 10; return s;
}

/* ================= KARAKTER ================= */
const shadowMat = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .28, depthWrite: false });
function human(o) {
  const g = new THREE.Group(), legL = new THREE.Group(), legR = new THREE.Group(), armL = new THREE.Group(), armR = new THREE.Group();
  [[legL, -0.16], [legR, 0.16]].forEach(([l, x]) => { l.position.set(x, 0.72, 0); B(0.24, 0.72, 0.26, o.pants, 0, -0.72, 0, l); B(0.26, 0.12, 0.34, '#1b1b1b', 0, -0.72, 0.04, l); g.add(l); });
  B(0.62, 0.66, 0.36, o.shirt, 0, 0.72, 0, g);
  if (o.vest) { B(0.64, 0.5, 0.38, o.vest, 0, 0.84, 0, g); B(0.66, 0.07, 0.4, '#e9e9e9', 0, 1.02, 0, g); }
  if (o.tie) { B(0.2, 0.5, 0.02, '#f3f3f3', 0, 0.86, 0.19, g); B(0.07, 0.4, 0.03, o.tie, 0, 0.9, 0.2, g); }
  [[armL, -0.41], [armR, 0.41]].forEach(([a, x]) => { a.position.set(x, 1.36, 0); B(0.18, 0.56, 0.22, o.sleeve || o.shirt, 0, -0.56, 0, a); B(0.17, 0.13, 0.19, o.skin, 0, -0.69, 0, a); g.add(a); });
  B(0.2, 0.08, 0.2, o.skin, 0, 1.38, 0, g);
  B(0.46, 0.44, 0.42, o.skin, 0, 1.44, 0, g);
  B(0.07, 0.09, 0.02, '#1b1b1b', -0.11, 1.62, 0.215, g); B(0.07, 0.09, 0.02, '#1b1b1b', 0.11, 1.62, 0.215, g);
  if (o.helmet) { B(0.54, 0.2, 0.5, o.helmet, 0, 1.84, 0, g); B(0.56, 0.05, 0.66, o.helmet, 0, 1.84, 0.05, g); }
  else if (o.cap) { B(0.5, 0.14, 0.46, o.cap, 0, 1.86, 0, g); B(0.5, 0.04, 0.3, o.cap, 0, 1.86, 0.3, g); B(0.5, 0.18, 0.1, o.hair || '#1b1b1b', 0, 1.6, -0.21, g); }
  else { B(0.5, 0.14, 0.46, o.hair, 0, 1.86, 0, g); B(0.5, o.long ? 0.6 : 0.32, 0.1, o.hair, 0, o.long ? 1.3 : 1.56, -0.21, g); B(0.06, 0.26, 0.4, o.hair, -0.25, 1.64, -0.02, g); B(0.06, 0.26, 0.4, o.hair, 0.25, 1.64, -0.02, g); }
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.42, 12), shadowMat); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02; g.add(sh);
  g.userData = { legL, legR, armL, armR, w: 0, hit: 0 };
  scene.add(g); return g;
}
function animHuman(h, moving, dt) {
  const u = h.userData; if (moving) u.w += dt * 11; else u.w *= 0.8;
  const s = Math.sin(u.w) * (moving ? 0.65 : 0.0);
  u.legL.rotation.x = s; u.legR.rotation.x = -s; u.armL.rotation.x = -s * 0.8; u.armR.rotation.x = s * 0.8;
  if (u.hit > 0) { u.hit -= dt; h.children.forEach(c => c.visible = Math.floor(u.hit * 20) % 2 === 0); if (u.hit <= 0) h.children.forEach(c => c.visible = true); }
}
const SKIN = ['#e0a875', '#c98d5c', '#b07a4f'];

/* ================= DUNIA ================= */
const conveyorBoxes = [], cardMeshes = [], npcs = [];
let plane, arrow, player;

function floorTex() {
  const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d');
  x.fillStyle = '#9a9d95'; x.fillRect(0, 0, 32, 32); x.fillStyle = '#8f928a'; x.fillRect(0, 0, 16, 16); x.fillRect(16, 16, 16, 16);
  x.fillStyle = '#82857e'; x.fillRect(0, 0, 32, 1); x.fillRect(0, 0, 1, 32);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(24, 18); t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t;
}
function cardboard(x, y, z, par = scene, s = 1) {
  const b = B(0.9 * s, 0.7 * s, 0.7 * s, Math.random() < .5 ? '#c98a4b' : '#b57b40', x, y, z, par);
  B(0.16 * s, 0.72 * s, 0.72 * s, '#e8d6a8', x, y, z, par); return b;
}
function buildWorld() {
  // tanah luar, apron & landasan
  B(220, 0.2, 220, '#7c9466', 0, -0.42, 0);
  B(90, 0.2, 50, '#5f676b', 8, -0.3, -46);
  for (let x = -30; x < 50; x += 6) B(3, 0.02, 0.3, '#f3f3f3', x, -0.1, -40);
  B(90, 0.02, 0.25, '#ffd23f', 8, -0.1, -22);
  // menara bandara
  const tw = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 14, 8), mat('#d9dde0')); tw.position.set(-26, 7, -55); scene.add(tw);
  B(5, 2.2, 5, '#2b3a44', -26, 14, -55); B(5.6, 0.4, 5.6, '#e9eef0', -26, 16.2, -55);
  // lantai gudang
  const fl = new THREE.Mesh(geo(48, 0.2, 36), new THREE.MeshLambertMaterial({ map: floorTex() })); fl.position.set(0, -0.1, 0); scene.add(fl);
  [[-24, 0, 0.6, 36], [24, 0, 0.6, 36]].forEach(([x, z, w, d]) => { B(w, 6, d, '#2f6e75', x, 0, z, scene, true); B(w + 0.05, 0.5, d, '#24575d', x, 0, z); });
  B(30, 6, 0.6, '#2f6e75', -9, 0, -18, scene, true); B(6, 6, 0.6, '#2f6e75', 21, 0, -18, scene, true); B(12, 1.6, 0.6, '#2f6e75', 12, 4.4, -18);
  B(12, 0.9, 0.35, '#ffd23f', 12, 0, -17.4, scene, true); for (let x = 6.5; x < 18; x += 1.5) B(0.6, 0.92, 0.37, '#1b1b1b', x, 0, -17.4);
  B(21, 1.1, 0.6, '#2f6e75', -13.5, 0, 18, scene, true); B(21, 1.1, 0.6, '#2f6e75', 13.5, 0, 18, scene, true);
  B(6, 1.1, 0.4, '#9fb3b0', 0, 0, 18, scene, true);
  sign('GERBANG', null, '#ffd23f', 5, 1.2, 0, 0.03, 16.4, 0, 30).rotation.x = -Math.PI / 2;
  for (let z = -14; z <= 14; z += 7) { B(0.1, 1.6, 3, '#9fd3dc', -23.66, 3.2, z); B(0.1, 1.6, 3, '#9fd3dc', 23.66, 3.2, z); }
  sign('GUDANG KARGO IAS', '#ffd23f', '#1a1300', 14, 1.6, -9, 4.4, -17.66, 0, 34);
  B(0.15, 0.02, 30, '#ffd23f', -2.5, 0, 2); B(0.15, 0.02, 30, '#ffd23f', 2.5, 0, 2);

  // ---- area sortir (barat) ----
  B(16, 0.8, 1.6, '#3a3f44', -14, 0, 1, scene, true); B(16, 0.06, 1.4, '#1f2326', -14, 0.8, 1);
  B(16, 0.14, 0.1, '#c7d0d4', -14, 0.84, 0.24); B(16, 0.14, 0.1, '#c7d0d4', -14, 0.84, 1.76);
  B(0.22, 2.4, 0.22, '#9aa5ab', -9, 0, -0.1); B(0.22, 2.4, 0.22, '#9aa5ab', -9, 0, 2.1); B(0.32, 0.32, 2.4, '#c7d0d4', -9, 2.4, 1);
  for (let i = 0; i < 6; i++) { const b = cardboard(-21 + i * 2.8, 0.86, 1, scene, 0.9); conveyorBoxes.push(b); }
  sign('SORTIR', '#ffd23f', '#1a1300', 4, 0.9, -14, 3.6, 1, 0, 26);
  PORT.forEach((p, i) => {
    const x = -20.4 + i * 3.2, z = 5.4;
    B(2.6, 0.08, 2.1, p.col, x, 0, z);
    [[-1.25, -1], [1.25, -1], [-1.25, 1], [1.25, 1]].forEach(([dx, dz]) => B(0.14, 1.6, 0.14, p.col, x + dx, 0, z + dz));
    B(2.64, 0.12, 0.12, p.col, x, 1.5, z + 1); B(2.64, 0.12, 0.12, p.col, x, 1.5, z - 1);
    for (let k = -1; k <= 1; k += 0.4) B(0.05, 1.5, 0.05, p.col, x + k, 0, z + 1);
    for (let k = -0.8; k <= 0.8; k += 0.4) { B(0.05, 1.5, 0.05, p.col, x - 1.25, 0, z + k); B(0.05, 1.5, 0.05, p.col, x + 1.25, 0, z + k); }
    solid(x, z, 2.7, 2.2);
    const s = sprite(p.ab, '#0a1a1d', p.col, 1.1, 0.55, 22); s.position.set(x, 2.3, z); scene.add(s);
  });

  // ---- rak (timur) ----
  [-6, -1, 4, 9].forEach(z => {
    for (let x = 8; x <= 21.1; x += 3.25) { B(0.14, 4, 0.14, '#2f6e9e', x, 0, z - 0.65); B(0.14, 4, 0.14, '#2f6e9e', x, 0, z + 0.65); }
    [0.15, 1.35, 2.55, 3.75].forEach(y => { B(13.2, 0.14, 0.12, '#e46b2e', 14.5, y, z - 0.65); B(13.2, 0.14, 0.12, '#e46b2e', 14.5, y, z + 0.65); B(13.2, 0.04, 1.3, '#6b7377', 14.5, y + 0.14, z); });
    for (let x = 9; x < 21; x += 1.6) [0.33, 1.53, 2.73].forEach(y => { if (Math.random() < .72) cardboard(x, y, z, scene, 0.95 + Math.random() * .2); });
    solid(14.5, z, 13.4, 1.5);
  });
  // forklift
  const fk = new THREE.Group(); fk.position.set(4.5, 0, -3.5); fk.rotation.y = 0.5; scene.add(fk);
  B(1.4, 0.9, 2.2, '#ffd23f', 0, 0.3, 0, fk); B(1.3, 0.1, 1.2, '#1b1b1b', 0, 2.2, 0.2, fk); [[-.6, .6], [.6, .6], [-.6, -.3], [.6, -.3]].forEach(([x, z]) => B(0.08, 1.1, 0.08, '#1b1b1b', x, 1.2, z + .2, fk));
  B(0.16, 2.6, 0.16, '#555', -0.4, 0.3, 1.2, fk); B(0.16, 2.6, 0.16, '#555', 0.4, 0.3, 1.2, fk); B(0.12, 0.06, 1.2, '#555', -0.3, 0.3, 1.8, fk); B(0.12, 0.06, 1.2, '#555', 0.3, 0.3, 1.8, fk);
  [[-.7, .7], [.7, .7], [-.7, -.7], [.7, -.7]].forEach(([x, z]) => B(0.25, 0.6, 0.6, '#1b1b1b', x, 0, z, fk));
  solid(4.5, -3.5, 2.6, 3);
  // palet & ULD dekat pintu apron
  [[7.5, -15], [16.5, -15], [20.5, -12]].forEach(([x, z]) => { B(1.9, 1.7, 1.9, '#aab4b9', x, 0.15, z, scene, true); B(1.95, 0.15, 1.95, '#7d878c', x, 0, z); B(1.92, 0.25, 1.92, '#d5dcdf', x, 1.6, z); });
  for (let i = 0; i < 4; i++) cardboard(-2 + (i % 2) * 1, 0 + (i > 1 ? 0.7 : 0), 15.6);
  solid(-1.5, 15.6, 2.2, 1);

  // ---- menara kontrol / ruang direksi (barat laut) ----
  B(20.6, 0.04, 10.6, '#5b2f3a', -13.4, 0, -12.4);
  const glass = new THREE.MeshLambertMaterial({ color: '#8fd0e0', transparent: true, opacity: .32 });
  B(16.2, 2.8, 0.12, glass, -15.6, 0, -7, scene, true); B(1.5, 2.8, 0.12, glass, -3.75, 0, -7, scene, true); B(0.12, 2.8, 10.8, glass, -3, 0, -12.4, scene, true);
  B(16.2, 0.25, 0.16, '#1b2a31', -15.6, 0, -7); B(1.5, 0.25, 0.16, '#1b2a31', -3.75, 0, -7); B(0.16, 0.25, 10.8, '#1b2a31', -3, 0, -12.4);
  B(20.6, 0.2, 0.2, '#1b2a31', -13.4, 2.8, -7); B(0.2, 0.2, 10.8, '#1b2a31', -3, 2.8, -12.4);
  sign('MENARA KONTROL', '#ffd23f', '#1a1300', 5.6, 0.8, -6, 3.4, -6.92, 0, 22);
  DIR.forEach((d, i) => {
    const x = -20 + (i % 3) * 5, z = i < 3 ? -15.2 : -9.6;
    B(2.4, 0.86, 1, '#8a5a3c', x, 0, z, scene, true); B(2.5, 0.07, 1.1, '#a8754f', x, 0.86, z); B(0.8, 0.5, 0.06, '#222', x, 0.93, z - 0.3); B(0.3, 0.12, 0.2, '#444', x, 0.93, z - 0.25);
    B(0.5, 0.06, 0.3, d.col, x + 0.7, 0.93, z + 0.2);
    const h = human({ skin: SKIN[i % 3], shirt: d.suit, sleeve: d.suit, pants: '#1f2326', hair: d.hair, tie: d.col, long: i === 1 || i === 4 });
    h.position.set(x, 0, z - 1.0);
    const tag = sprite([{ text: d.ab, color: d.col }, { text: d.n, color: '#f3ecd8' }], 'rgba(10,26,29,.88)', '#f3ecd8', 4.4, 0.95, 12); tag.position.set(x, 2.55, z - 1); scene.add(tag);
    addNpc({ id: 'dir' + i, mesh: h, x, z: z - 1.0, face: 0, name: d.n, role: d.j, solidR: 0, reach: 2.7, talk: () => talkDirector(i), dir: i });
  });
  for (let i = 0; i < 3; i++) { B(0.5, 0.5, 0.5, '#7a5236', -22.8, 0, -16.8 + i * 4.5); B(0.7, 0.9, 0.7, '#3f8f4a', -22.8, 0.5, -16.8 + i * 4.5); }

  // ---- pesawat di apron ----
  plane = new THREE.Group(); plane.position.set(12, 0, -31); scene.add(plane);
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 20, 10), mat('#e9eef0')); fus.rotation.z = Math.PI / 2; fus.position.y = 2.6; plane.add(fus);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 8), mat('#e9eef0')); nose.scale.set(1.6, 1, 1); nose.position.set(10, 2.6, 0); plane.add(nose);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4, 10), mat('#e9eef0')); tail.rotation.z = Math.PI / 2; tail.position.set(-12, 2.9, 0); plane.add(tail);
  B(20, 0.35, 3.3, '#0f8b8d', 0, 2.3, 0, plane); B(3.2, 0.3, 20, '#c3cdd1', 0.5, 2.0, 0, plane); B(1.6, 3.4, 0.3, '#0f8b8d', -12.2, 3.6, 0, plane); B(1.6, 0.25, 6.5, '#c3cdd1', -12.4, 3.3, 0, plane);
  [-5, 5].forEach(z => { const en = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, 2, 8), mat('#9aa5ab')); en.rotation.z = Math.PI / 2; en.position.set(1.4, 1.5, z); plane.add(en); });
  B(1.3, 0.5, 0.05, '#2b3a44', 10.5, 3.3, 1.42, plane); B(1.3, 0.5, 0.05, '#2b3a44', 10.5, 3.3, -1.42, plane);
  for (let x = -8; x < 8; x += 1.4) B(0.4, 0.4, 3.24, '#2b3a44', x, 3.3, 0, plane);
  B(2.4, 2, 0.06, '#1b2328', 3.5, 1.6, 1.62, plane);
  [[7, 0], [-1, 1.4], [-1, -1.4]].forEach(([x, z]) => B(0.25, 1.1, 0.25, '#333', x, 0, z, plane));
  const pl = sprite('IAS', null, '#0f5257', 2, 1, 30); pl.position.set(-4, 3.6, 1.7); pl.material.depthTest = true; plane.add(pl);

  // panah penunjuk tujuan
  arrow = new THREE.Group(); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 4), new THREE.MeshBasicMaterial({ color: '#ffd23f' }));
  cone.rotation.x = Math.PI / 2; cone.position.z = 0.35; arrow.add(cone); arrow.visible = false; scene.add(arrow);

  // kartu info koleksi
  const spots = [[11, -3.5], [17.5, 1.5], [13, 6.5], [19.5, 12.5], [10, -9.5], [-20.5, 10.5], [-1.5, -12], [-21.5, -4.5], [5.5, 7], [-15, -4.5], [-5, 14.5], [21, -15]];
  const cm = new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#a07a00' });
  INFO.forEach((inf, i) => { const [x, z] = spots[i]; const m = new THREE.Mesh(geo(0.55, 0.55, 0.55), cm); m.position.set(x, 0.8, z); scene.add(m);
    const q = sprite('?', null, '#1a1300', 0.5, 0.5, 26); q.position.set(0, 0, 0.29); q.material.depthTest = true; m.add(q); cardMeshes.push({ m, i, x, z }); });

  // kru gudang
  addNpc({ id: 'raka', mesh: human({ skin: SKIN[1], shirt: '#3b7dd8', pants: '#2c4a6e', helmet: '#f3f3f3', vest: '#d8e03a' }), x: 3.2, z: 13.2, face: Math.PI * 0.9, ...NPC.raka, talk: talkRaka });
  addNpc({ id: 'sari', mesh: human({ skin: SKIN[0], shirt: '#0f8b8d', pants: '#2b2b2b', helmet: '#ff8a2b', vest: '#ff8a2b' }), x: -4.6, z: 5, face: Math.PI / 2, ...NPC.sari, talk: talkSari });
  addNpc({ id: 'dina', mesh: human({ skin: SKIN[0], shirt: '#0f5257', pants: '#22303a', hair: '#1b1b1b', long: true }), x: -6, z: -5.2, face: 0, ...NPC.dina, talk: talkDina });
  addNpc({ id: 'bima', mesh: human({ skin: SKIN[2], shirt: '#f3f3f3', pants: '#1f3b73', cap: '#1b1b1b', vest: '#ff8a2b' }), x: 12, z: -15.4, face: 0, ...NPC.bima, talk: talkBima });
  player = human({ skin: SKIN[0], shirt: '#2c4a6e', pants: '#26303a', helmet: '#ffd23f', vest: '#ff8a2b' });
  player.position.set(0, 0, 15.5); player.rotation.y = Math.PI;
}
function addNpc(n) {
  n.mesh.position.set(n.x, 0, n.z); n.mesh.rotation.y = n.face; n.home = n.face;
  n.mark = sprite('!', '#e4572e', '#ffffff', 0.6, 0.6, 30); n.mark.position.set(n.x, 3.3, n.z); n.mark.visible = false; scene.add(n.mark);
  if (!n.dir && n.dir !== 0) { const tag = sprite(n.name, 'rgba(10,26,29,.8)', '#ffd23f', 2.8, 0.45, 13); tag.position.set(n.x, 2.4, n.z); scene.add(tag); }
  n.reach = n.reach || 2.2; npcs.push(n);
}

/* ================= INPUT ================= */
const keys = {}, joy = { x: 0, y: 0, id: null };
addEventListener('keydown', e => { const k = e.key.toLowerCase(); keys[k] = true; if (['e', ' ', 'enter'].includes(k) && !e.target.closest('input,textarea,select,button')) { e.preventDefault(); pressA(); } });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
const jz = $('#joy'), knob = $('#knob');
function joyMove(e) { const r = jz.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const L = Math.hypot(dx, dy), M = r.width / 2 - 10;
  if (L > M) { dx *= M / L; dy *= M / L; } joy.x = dx / M; joy.y = dy / M; knob.style.transform = `translate(${dx}px,${dy}px)`; }
jz.addEventListener('pointerdown', e => { joy.id = e.pointerId; jz.setPointerCapture(e.pointerId); joyMove(e); });
jz.addEventListener('pointermove', e => { if (e.pointerId === joy.id) joyMove(e); });
const joyEnd = e => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; };
jz.addEventListener('pointerup', joyEnd); jz.addEventListener('pointercancel', joyEnd);
$('#aBtn').addEventListener('click', pressA);
function pressA() { if (G.aOverride) return G.aOverride(); if (G.mode === 'play' && !G.lock && G.aAct) G.aAct.talk(); }

/* ================= UI: DIALOG ================= */
const first = () => (G.P.nama || '').split(' ')[0];
function say(who, lines) {
  return new Promise(res => {
    G.lock++; const box = $('#dlg'); box.hidden = false; let i = 0, full = '', n = 0, tm = null;
    const show = () => { full = lines[i].replaceAll('{nama}', first()); n = 0; $('#dWho').textContent = who.toUpperCase(); clearInterval(tm);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { $('#dTxt').textContent = full; return; }
      tm = setInterval(() => { n += 2; $('#dTxt').textContent = full.slice(0, n); if (n >= full.length) { clearInterval(tm); tm = null; } }, 18); };
    const next = () => { if (tm) { clearInterval(tm); tm = null; $('#dTxt').textContent = full; return; } i++; if (i < lines.length) show(); else { box.hidden = true; box.onclick = null; G.aOverride = null; G.lock--; res(); } };
    box.onclick = next; G.aOverride = next; show();
  });
}

/* ================= UI: DUEL KUIS ================= */
let D = null;
function faceOff(n) { const f = n.home; const px = n.x + Math.sin(f) * 2.2, pz = n.z + Math.cos(f) * 2.2; player.position.set(px, 0, pz); player.rotation.y = f + Math.PI;
  G.camShot = { n, px, pz }; }
function duel(n, qs, timed, zone) {
  return new Promise(res => {
    G.lock++; faceOff(n); $('#duel').hidden = false; $('#foeName').textContent = n.name.toUpperCase(); $('#foeRole').textContent = n.role;
    D = { qs, i: 0, hp: qs.length, timed, zone, res, n, open: false, ok: 0 }; $('#foeHp').style.width = '100%'; askD();
  });
}
function askD() {
  const it = D.qs[D.i]; $('#duelNo').textContent = `${D.n.name.toUpperCase()} BERTANYA · ${D.i + 1}/${D.qs.length}`; $('#duelQ').textContent = it.q;
  D.opts = shuffle(it.a.map((a, k) => ({ a, ok: k === 0 })));
  $('#moves').innerHTML = D.opts.map((o, k) => `<button class="btn" data-k="${k}">${esc(o.a)}</button>`).join('');
  $('#moves').querySelectorAll('button').forEach(b => b.onclick = () => answerD(+b.dataset.k));
  $('#duelFb').hidden = true; $('#duelNext').hidden = true; $('#tbar').hidden = !D.timed; D.left = QUIZ_TIME; D.open = true; $('#tfill').style.width = '100%';
}
function answerD(k) {
  if (!D || !D.open) return; D.open = false; const it = D.qs[D.i], ok = k >= 0 && D.opts[k].ok; G.total++;
  $('#moves').querySelectorAll('button').forEach((b, j) => { b.disabled = true; b.style.opacity = 1; if (D.opts[j].ok) b.classList.add('right'); else if (j === k) b.classList.add('wrong'); });
  let pts = 0; if (ok) { pts = D.timed ? 100 + Math.round(D.left) * 5 : 100; G.right++; D.ok++; addScore(pts, D.zone); D.hp--; $('#foeHp').style.width = (D.hp / D.qs.length * 100) + '%'; D.n.mesh.userData.hit = 0.45; }
  else player.userData.hit = 0.45;
  const fb = $('#duelFb'); fb.hidden = false; fb.className = 'fb' + (ok ? '' : ' bad');
  fb.innerHTML = `<b>${ok ? 'Efektif sekali! +' + pts : k < 0 ? 'Waktu habis!' : 'Jurusmu meleset!'}</b>${esc(it.e)}`;
  $('#duelNext').hidden = false; toast(ok ? '+' + pts : 'MELESET', !ok);
  if (D.zone === 3) loadUld(ok);
}
$('#duelNext').onclick = () => { D.i++; if (D.i < D.qs.length) askD(); else { const d = D; D = null; $('#duel').hidden = true; G.camShot = null; G.lock--; d.res(d.ok); } };

/* ================= UI: SORTIR ================= */
let S = null;
$('#bins').innerHTML = PORT.map((p, i) => `<button class="btn" data-i="${i}" style="background:${p.col}">${esc(p.name)}</button>`).join('');
$('#bins').querySelectorAll('button').forEach(b => b.onclick = () => pickS(+b.dataset.i));
function sortGame() { return new Promise(res => { G.lock++; G.camShot = { sort: true }; $('#sort').hidden = false; S = { items: shuffle(SORT).slice(0, SORT_N), i: 0, streak: 0, res, ok: 0 }; askS(); }); }
function askS() { const it = S.items[S.i]; S.limit = Math.max(5, 9 - S.i * 0.35); S.left = S.limit; S.open = true;
  $('#sortNo').textContent = `PAKET ${S.i + 1}/${S.items.length}` + (S.streak > 1 ? ` · STREAK x${S.streak}` : ''); $('#sortLbl').textContent = it.t;
  $('#bins').hidden = false; $('#sortFb').hidden = true; $('#sortNext').hidden = true; }
function pickS(i) { if (!S || !S.open) return; S.open = false; const it = S.items[S.i], ci = PORT.findIndex(p => p.id === it.p), ok = i === ci; G.total++;
  let pts = 0; if (ok) { S.streak++; S.ok++; pts = 100 + Math.min(S.streak - 1, 5) * 10; G.right++; addScore(pts, 1); } else S.streak = 0;
  toast(ok ? '+' + pts : i < 0 ? 'TERLEWAT' : 'SALAH KANDANG', !ok);
  const fb = $('#sortFb'); fb.hidden = false; fb.className = 'fb' + (ok ? '' : ' bad'); fb.innerHTML = `<b>${ok ? 'Masuk kandang yang tepat!' : 'Seharusnya: ' + esc(PORT[ci].name)}</b>${esc(it.e)}`;
  $('#bins').hidden = true; $('#sortNext').hidden = false; }
$('#sortNext').onclick = () => { S.i++; if (S.i < S.items.length) askS(); else { const s = S; S = null; $('#sort').hidden = true; G.camShot = null; G.lock--; s.res(s.ok); } };

/* ================= QUEST ================= */
const npcById = id => npcs.find(n => n.id === id);
function addScore(p, zone) { G.score += p; if (zone != null) G.z[zone] += p; hud(); }
function setObjective(text, id) { $('#obj').textContent = text; G.target = id ? npcById(id) : null; npcs.forEach(n => n.mark.visible = false); if (G.target) G.target.mark.visible = true; }
function giveBadge(i) { G.badges[i] = 1; hud(); toast('LENCANA ' + (i + 1) + ' DIDAPAT!'); }
function hud() {
  $('#pts').textContent = fmt(G.score);
  $('#badges').innerHTML = BADGES.map((b, i) => `<i class="${G.badges[i] ? 'on' : ''}" style="--c:${b.c}">${b.ab}</i>`).join('');
  $('#cardsCount').textContent = `Kartu info: ${G.cards.size}/${INFO.length}`;
}
const hint = () => ['Temui Mas Raka dulu di dekat gerbang, ya.', 'Bu Sari sedang menunggumu di area sortir.', 'Mbak Dina menunggumu di depan Menara Kontrol.', 'Kapten Bima menunggumu di pintu apron.'][Math.min(G.stage, 3)];

async function talkRaka() {
  const n = npcById('raka'); if (G.stage > 0) return say(n.name, ['Kerja bagus! ' + hint()]);
  await say(n.name, BRIEF); await duel(n, BRIEF_Q, false, 0);
  await say(n.name, ['Mantap! Ini Lencana Briefing untukmu.', 'Berikutnya temui Bu Sari di area sortir, sebelah barat. Ikuti panah kuning di lantai.', 'Oh ya, ada kotak kuning bertanda tanya di seluruh gudang. Itu kartu info. Kumpulkan sebanyak mungkin!']);
  giveBadge(0); G.stage = 1; setObjective('Temui Bu Sari di area sortir', 'sari');
}
async function talkSari() {
  const n = npcById('sari'); if (G.stage !== 1) return say(n.name, [G.stage < 1 ? hint() : 'Conveyor aman berkat kamu. ' + hint()]);
  await say(n.name, SARI); await sortGame();
  await say(n.name, ['Hebat! Kamu sekarang hafal 5 portofolio IAS. Ini Lencana Sortir.', 'Selanjutnya ke Menara Kontrol di barat laut. Mbak Dina akan mengenalkanmu pada Direksi.']);
  giveBadge(1); G.stage = 2; setObjective('Temui Mbak Dina di depan Menara Kontrol', 'dina');
}
async function talkDina() {
  const n = npcById('dina');
  if (G.stage < 2) return say(n.name, [hint()]);
  if (G.stage > 2) return say(n.name, ['Terima kasih sudah membantu Direksi. ' + hint()]);
  if (!G.dinaIntro) { await say(n.name, DINA); G.dinaIntro = true; updateDirObjective(); return; }
  if (G.met.size < DIR.length) return say(n.name, [`Kamu baru kenal ${G.met.size} dari ${DIR.length} direktur. Temui semuanya dulu, ya.`]);
  if (!G.man.length) { await say(n.name, DINA2); G.man = shuffle(MAN).slice(0, MAN_N); G.mi = 0; G.tries = 0; manObjective(); return; }
  return say(n.name, ['Manifest yang kamu bawa: "' + G.man[G.mi].t + '". Antar ke direktur yang membidanginya.']);
}
function updateDirObjective() { setObjective(`Kenalan dengan Direksi (${G.met.size}/${DIR.length})`, null); npcs.forEach(n => { if (n.dir != null) n.mark.visible = !G.met.has(n.dir); });
  if (G.met.size === DIR.length) setObjective('Kembali ke Mbak Dina', 'dina'); }
function manObjective() { setObjective(`Antar manifest ${G.mi + 1}/${G.man.length}: ${G.man[G.mi].t}`, null); }
async function talkDirector(i) {
  const d = DIR[i], n = npcById('dir' + i);
  if (G.stage < 2 || !G.dinaIntro) return say(d.n, ['Selamat datang. Silakan lapor dulu ke Mbak Dina di depan, ya.']);
  if (G.stage > 2) return say(d.n, ['Selamat bergabung di IAS. Semoga sukses!']);
  if (!G.man.length) {
    if (!G.met.has(i)) { await say(d.n, [`Halo ${first()}, saya ${d.n}, ${d.j} IAS.`, d.r]); G.met.add(i); updateDirObjective(); }
    else await say(d.n, [`Saya ${d.n}, ${d.j}.`]);
    return;
  }
  const m = G.man[G.mi];
  if (G.tries === 0) G.total++;
  if (m.d === i) {
    if (G.tries === 0) { G.right++; addScore(150, 2); toast('+150'); } else toast('TERKIRIM');
    n.mesh.userData.hit = 0.3; await say(d.n, ['Terima kasih, ini memang bidang saya. Manifest saya tandatangani!']);
    G.mi++; G.tries = 0;
    if (G.mi < G.man.length) manObjective();
    else { await say(NPC.dina.name, ['Semua manifest sudah ditandatangani. Ini Lencana Direksi!', 'Terakhir, temui Kapten Bima di pintu apron (timur laut). Pesawat menunggu muatan.']); giveBadge(2); G.stage = 3; setObjective('Temui Kapten Bima di pintu apron', 'bima'); }
  } else {
    G.tries++; toast('BUKAN BIDANGNYA', true);
    const c = DIR[m.d];
    await say(d.n, G.tries >= 2 ? [`Ini bukan bidang saya. Manifest ini untuk ${c.j}, yaitu ${c.n}.`] : ['Hmm, ini bukan bidang saya. Coba pikirkan lagi siapa yang membidanginya.']);
  }
}
async function talkBima() {
  const n = npcById('bima'); if (G.stage !== 3) return say(n.name, [G.stage < 3 ? hint() : 'Selamat jalan, rookie!']);
  await say(n.name, BIMA); A.loaded = 0;
  await duel(n, shuffle(QUIZ).slice(0, QUIZ_N), true, 3);
  giveBadge(3); G.stage = 4; setObjective('Pesawat siap lepas landas!', null);
  await say(n.name, [`Muatan terisi ${A.loaded}/${QUIZ_N} kontainer. Kerja bagus, ${first()}! Lihat, pesawatnya berangkat!`]);
  takeoff();
}
const A = { loaded: 0, ulds: [] };
function loadUld(ok) { if (!ok) return; A.loaded++; const u = B(1.4, 1.3, 1.4, '#aab4b9', 9 + A.loaded * 0.7, 0, -20.5); A.ulds.push({ m: u, k: 0 }); }

/* ================= KAMERA, LOOP ================= */
const clock = new THREE.Clock(); let T = 0;
const camPos = new THREE.Vector3(0, 12, 26), camLook = new THREE.Vector3(0, 0, 10), tmpV = new THREE.Vector3(), tmpL = new THREE.Vector3();
function blocked(x, z) {
  const r = 0.42; if (x < -23.4 || x > 23.4 || z < -17.2 || z > 17.4) return true;
  for (const c of colliders) if (x + r > c.x0 && x - r < c.x1 && z + r > c.z0 && z - r < c.z1) return true;
  for (const n of npcs) { if (n.solidR === 0) continue; const dx = x - n.x, dz = z - n.z; if (dx * dx + dz * dz < 0.7) return true; }
  return false;
}
function update(dt) {
  T += dt;
  conveyorBoxes.forEach(b => { b.position.x += dt * 1.6; if (b.position.x > -6.4) b.position.x -= 16.8; });
  cardMeshes.forEach(c => { if (!c.m.visible) return; c.m.rotation.y += dt * 1.8; c.m.position.y = 0.8 + Math.sin(T * 3 + c.i) * 0.12; });
  npcs.forEach(n => { n.mark.position.y = 3.3 + Math.sin(T * 4) * 0.1; animHuman(n.mesh, false, dt); });
  A.ulds.forEach(u => { if (u.k < 1) { u.k = Math.min(1, u.k + dt * 0.8); u.m.position.z = -20.5 - u.k * 9; u.m.position.y = u.k * 1.2; if (u.k >= 1) u.m.visible = false; } });
  if (D && D.open && D.timed) { D.left = Math.max(0, D.left - dt); $('#tfill').style.width = (D.left / QUIZ_TIME * 100) + '%'; if (D.left <= 0) answerD(-1); }
  if (S && S.open) { S.left = Math.max(0, S.left - dt); $('#sfill').style.width = (S.left / S.limit * 100) + '%'; if (S.left <= 0) pickS(-1); }

  let moving = false;
  if (G.mode === 'play' && !G.lock) {
    let ix = joy.x + ((keys.d || keys.arrowright) ? 1 : 0) - ((keys.a || keys.arrowleft) ? 1 : 0);
    let iz = joy.y + ((keys.s || keys.arrowdown) ? 1 : 0) - ((keys.w || keys.arrowup) ? 1 : 0);
    const L = Math.hypot(ix, iz);
    if (L > 0.12) {
      if (L > 1) { ix /= L; iz /= L; }
      const vx = ix * SPEED * dt, vz = iz * SPEED * dt, p = player.position;
      if (!blocked(p.x + vx, p.z)) p.x += vx; if (!blocked(p.x, p.z + vz)) p.z += vz;
      const want = Math.atan2(ix, iz); let dr = want - player.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); player.rotation.y += dr * Math.min(1, dt * 14);
      moving = true;
    }
    // kartu info
    cardMeshes.forEach(c => { if (c.m.visible && Math.hypot(player.position.x - c.x, player.position.z - c.z) < 1.1) collectCard(c); });
    // interaksi terdekat
    let best = null, bd = 1e9; npcs.forEach(n => { const d = Math.hypot(player.position.x - n.x, player.position.z - n.z); if (d < n.reach && d < bd) { bd = d; best = n; } });
    G.aAct = best; $('#aBtn').classList.toggle('live', !!best); const pr = $('#prompt');
    if (best) { pr.hidden = false; pr.textContent = (G.stage === 2 && G.man.length && best.dir != null ? 'SPACE · Serahkan manifest ke ' : 'SPACE · Bicara dengan ') + best.name; } else pr.hidden = true;
    npcs.forEach(n => { const d = Math.hypot(player.position.x - n.x, player.position.z - n.z); const tgt = d < 3.2 ? Math.atan2(player.position.x - n.x, player.position.z - n.z) : n.home;
      let dr = tgt - n.mesh.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); n.mesh.rotation.y += dr * Math.min(1, dt * 6); });
  } else { $('#prompt').hidden = true; $('#aBtn').classList.remove('live'); }
  animHuman(player, moving, dt);

  // panah tujuan
  const tg = G.target; arrow.visible = false;
  if (G.mode === 'play' && !G.lock && tg) { const dx = tg.x - player.position.x, dz = tg.z - player.position.z, d = Math.hypot(dx, dz);
    if (d > 3.5) { arrow.visible = true; arrow.position.set(player.position.x + dx / d * 1.25, 0.12 + Math.sin(T * 6) * 0.05, player.position.z + dz / d * 1.25); arrow.rotation.y = Math.atan2(dx, dz); } }

  // kamera
  const p = player.position;
  if (G.mode === 'title') { const a = T * 0.12; tmpV.set(Math.sin(a) * 30, 20, Math.cos(a) * 26); tmpL.set(0, 0, -2); }
  else if (G.mode === 'takeoff') { tmpV.set(plane.position.x - 4, 9 + plane.position.y * 0.6, -92); tmpL.set(plane.position.x + 3, plane.position.y + 3, plane.position.z); }
  else if (G.camShot && G.camShot.sort) { tmpV.set(-14, 9, 13); tmpL.set(-14, -2.5, 2); }
  else if (G.camShot) { const n = G.camShot.n, mx = (n.x + p.x) / 2, mz = (n.z + p.z) / 2, f = n.home + Math.PI / 2; tmpV.set(mx + Math.sin(f) * 9, 2.2, mz + Math.cos(f) * 9); tmpL.set(mx, -1.2, mz); }
  else { const portrait = innerWidth < innerHeight; tmpV.set(p.x, p.y + (portrait ? 13 : 10), p.z + (portrait ? 10 : 9)); tmpL.set(p.x, 0.6, p.z - 1); }
  camPos.lerp(tmpV, Math.min(1, dt * 4)); camLook.lerp(tmpL, Math.min(1, dt * 5)); cam.position.copy(camPos); cam.lookAt(camLook);

  if (G.mode === 'takeoff') { G.tk += dt; plane.position.x += (3 + G.tk * 4) * dt; if (G.tk > 2.4) plane.position.y += (G.tk - 2.4) * 4 * dt; plane.rotation.z = Math.min(0.16, Math.max(0, (G.tk - 2.4) * 0.1)); }
}
function loop() { const dt = Math.min(0.05, clock.getDelta()); try { update(dt); renderer.render(scene, cam); } catch (e) { console.error(e); } requestAnimationFrame(loop); }

let cardT; function collectCard(c) {
  c.m.visible = false; G.cards.add(c.i); addScore(50, null); const inf = INFO[c.i];
  $('#icT').textContent = inf.t; $('#icD').textContent = inf.d; const ic = $('#infoCard'); ic.hidden = false; clearTimeout(cardT); cardT = setTimeout(() => ic.hidden = true, 4500);
  ic.onclick = () => ic.hidden = true;
}

/* ================= ALUR LAYAR ================= */
function showScr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); }
function playUi(on) { ['#hud', '#joy', '#aBtn'].forEach(s => $(s).hidden = !on); }
$('#bStart').onclick = () => { const p = LS.get('cr3d_profile', {}); ['Event', 'Nama', 'Nip', 'Unit', 'Lok', 'About'].forEach(k => { if (p[k]) $('#f' + k).value = p[k]; }); showScr('form'); };
$('#fBack').onclick = () => showScr('title');
$('#fReg').onsubmit = e => {
  e.preventDefault(); const v = k => $('#f' + k).value.trim(); const ev = cleanEv(v('Event')), miss = [];
  if (!ev) miss.push('kode event'); if (!v('Nama')) miss.push('nama'); if (!v('Unit')) miss.push('unit kerja'); if (!v('Lok')) miss.push('lokasi penempatan');
  if (miss.length) { $('#fErr').textContent = 'Lengkapi dulu: ' + miss.join(', ') + '.'; return; }
  $('#fErr').textContent = ''; LS.set('cr3d_profile', { Event: ev, Nama: v('Nama'), Nip: v('Nip'), Unit: v('Unit'), Lok: v('Lok'), About: v('About') });
  G.P = { event: ev, nama: v('Nama'), nip: v('Nip'), unit: v('Unit'), jabatan: '', penempatan: v('Lok'), tentang: v('About') };
  startGame();
};
function startGame() {
  if (G.started) return location.reload();
  G.started = true; G.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8); G.t0 = Date.now();
  showScr(''); playUi(true); G.mode = 'play'; hud(); setObjective('Temui Mas Raka di dekat gerbang', 'raka');
  camPos.set(0, 14, 26);
}
function takeoff() { G.lock++; G.mode = 'takeoff'; G.tk = 0; scene.fog.far = 220; camPos.set(8, 9, -92); playUi(false); setTimeout(finish, 5200); }

async function finish() {
  G.mode = 'done'; const acc = G.total ? G.right / G.total : 0; const rank = acc >= .85 ? 'Cargo Master' : acc >= .6 ? 'Cargo Crew' : 'Cargo Rookie';
  const rec = { id: G.id, event: G.P.event, nama: G.P.nama, nip: G.P.nip, unit: G.P.unit, jabatan: G.P.jabatan, penempatan: G.P.penempatan, tentang: G.P.tentang,
    score: G.score, benar: G.right, total: G.total, akurasi: Math.round(acc * 100), z_briefing: G.z[0], z_sortir: G.z[1], z_direksi: G.z[2], z_dispatch: G.z[3],
    kartu: G.cards.size, durasi: Math.round((Date.now() - G.t0) / 1000), predikat: rank };
  const d = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  $('#cert').innerHTML = `<div class="k">SERTIFIKAT SHIFT PERTAMA</div><div class="rk">${rank}</div><div class="k">DIBERIKAN KEPADA</div><div class="nm">${esc(G.P.nama)}</div>
    <p>${esc(G.P.unit)}<br>${esc(G.P.penempatan)}</p><div class="bd">${BADGES.map(b => `<i style="--c:${b.c}">${b.ab}</i>`).join('')}</div>
    <div class="k">${esc(G.P.event)} · ${esc(d)}</div><p style="font-size:14px">InJourney Aviation Services · Gudang IAS</p>`;
  $('#stats').innerHTML = `<div><b>${fmt(rec.score)}</b><span>Skor</span></div><div><b>${rec.akurasi}%</b><span>Akurasi</span></div><div><b>${rec.kartu}/${INFO.length}</b><span>Kartu</span></div><div><b>${Math.floor(rec.durasi / 60)}:${String(rec.durasi % 60).padStart(2, '0')}</b><span>Durasi</span></div>`;
  showScr('result'); $('#saveMsg').textContent = 'Menyimpan skor…';
  const ok = await saveScore(rec);
  $('#saveMsg').textContent = ok ? `Skor tersimpan di rekap event ${G.P.event}.` : 'Koneksi bermasalah. Skor disimpan di HP ini dan dikirim ulang otomatis saat game dibuka lagi.';
  try { const r = await fetch(`/api/leaderboard?event=${encodeURIComponent(G.P.event)}&me=${G.id}`); const j = await r.json();
    $('#board').innerHTML = j.rows.length ? `<table><thead><tr><th class="n">#</th><th>Nama</th><th>Unit</th><th class="n">Skor</th></tr></thead><tbody>${j.rows.map((x, i) => `<tr class="${x.me ? 'me' : ''}"><td class="n">${i + 1}</td><td>${esc(x.nama)}</td><td>${esc(x.unit)}</td><td class="n">${fmt(x.score)}</td></tr>`).join('')}</tbody></table>` : '<p class="mute">Belum ada data.</p>';
  } catch (e) { $('#board').innerHTML = '<p class="mute">Papan skor belum bisa dimuat.</p>'; }
}
async function post(rec) { const r = await fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) }); if (!r.ok) throw new Error(r.status); }
async function saveScore(rec) { try { await post(rec); return true; } catch (e) { const q = LS.get('cr3d_pending', []); q.push(rec); LS.set('cr3d_pending', q); return false; } }
async function flushPending() { const q = LS.get('cr3d_pending', []), left = []; for (const r of q) { try { await post(r); } catch (e) { left.push(r); } } LS.set('cr3d_pending', left); }
$('#bAgain').onclick = () => location.reload();

/* ================= MULAI ================= */
(async () => {
  try { await Promise.race([document.fonts.load('16px "Press Start 2P"'), wait(2500)]); } catch (e) { }
  buildWorld(); hud(); loop();
  const b = $('#bStart'); b.disabled = false; b.textContent = 'Mulai shift';
  flushPending();
  if (new URLSearchParams(location.search).has('debug')) window.__dbg = { G, player, npcs, takeoff, plane, cam }; // hanya untuk pengujian otomatis
})();
