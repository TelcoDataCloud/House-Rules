/* ===========================================================
   LOOKS: how every bullet is drawn

   Each kind of shot is painted once into a little picture, then
   that picture is stamped on the canvas wherever a shot is.

   Your shots are cool colours: cyan, green, purple, gold.
   Enemy shots are hot colours: pink, red, violet, with a dark
   outline so you can see them on bright levels.
   =========================================================== */

import { made2d } from './canvas.js';

// A bolt: a pointed glowing streak, bright in the middle.
function bolt(g, w, h, edge, core = '#ffffff', fadeDown = true) {
  const glow = g.createLinearGradient(0, 0, w, 0);
  glow.addColorStop(0, 'rgba(0,0,0,0)');
  glow.addColorStop(0.18, edge);
  glow.addColorStop(0.4, core);
  glow.addColorStop(0.6, core);
  glow.addColorStop(0.82, edge);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = glow;
  g.beginPath();
  g.moveTo(w / 2, 0);
  g.quadraticCurveTo(w, h * 0.15, w, h * 0.3);
  g.lineTo(w, h);
  g.lineTo(0, h);
  g.lineTo(0, h * 0.3);
  g.quadraticCurveTo(0, h * 0.15, w / 2, 0);
  g.fill();
  if (fadeDown) {
    // The tail fades away behind it.
    g.globalCompositeOperation = 'destination-in';
    const fade = g.createLinearGradient(0, 0, 0, h);
    fade.addColorStop(0, '#000');
    fade.addColorStop(0.55, '#000');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fade;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
  }
}

const SHOT_EDGE = { '': '#38f0ff', green: '#4dff7c', red: '#ff3b3b', purple: '#c07cff', gold: '#ffd23f', drone: '#ffab2e' };

// Your shot, w by h, in colour cls. The picture is bigger than the
// shot so the glow fits round it.
export function shotLook(cls, weak) {
  const key = `shot|${cls}|${weak}`;
  return made2d(key, 24, 44, (g) => {
    const w = weak ? 5 : cls === 'purple' ? 12 : cls === 'red' ? 10 : 8;
    const h = weak ? 20 : 28;
    const edge = SHOT_EDGE[cls] || SHOT_EDGE[''];
    g.translate(12 - w / 2, 22 - h / 2);
    g.shadowColor = edge;
    g.shadowBlur = weak ? 4 : 9;
    g.globalAlpha = weak ? 0.7 : 1;
    bolt(g, w, h, edge, cls === 'red' ? '#ffe0e0' : '#ffffff');
  });
}

// A homing missile: dark metal, glowing seeker nose, hot engine.
export function missileLook(big) {
  return made2d(`missile|${big}`, 24, 40, (g) => {
    const w = big ? 16 : 12;
    const h = big ? 30 : 22;
    g.translate(12 - w / 2, 18 - h / 2);
    g.shadowColor = '#ff3fa4';
    g.shadowBlur = 8;
    const body = g.createLinearGradient(0, 0, 0, h);
    body.addColorStop(0, '#ffffff'); body.addColorStop(0.07, '#ffffff');
    body.addColorStop(0.07, '#ff3fa4'); body.addColorStop(0.22, '#ff3fa4');
    body.addColorStop(0.22, '#d8dcea'); body.addColorStop(0.27, '#d8dcea');
    body.addColorStop(0.27, '#7a8098'); body.addColorStop(0.5, '#7a8098');
    body.addColorStop(0.5, '#3a3f56'); body.addColorStop(0.78, '#3a3f56');
    body.addColorStop(0.78, '#ff9a2a'); body.addColorStop(0.88, '#ff9a2a');
    body.addColorStop(0.88, '#fff6c0'); body.addColorStop(1, '#fff6c0');
    g.fillStyle = body;
    g.strokeStyle = '#10121e';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(w / 2, 0);
    g.quadraticCurveTo(w, h * 0.2, w, h * 0.45);
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.lineTo(0, h * 0.45);
    g.quadraticCurveTo(0, h * 0.2, w / 2, 0);
    g.fill();
    g.shadowBlur = 0;
    g.stroke();
  });
}

// --- enemy shots: hot colours, dark outlines ---

// An energy dart: a white-hot pointed head, a glowing body, and a tail
// that fades behind it, with a dark outline so it shows up anywhere.
// Drawn pointing DOWN (the way enemy shots fly); the game turns it.
function dart(g, w, h, core, mid, edge) {
  const cx = w / 2;
  // dark outline first
  g.save();
  g.fillStyle = 'rgba(10, 4, 14, 0.85)';
  g.beginPath();
  g.moveTo(cx, h + 2);
  g.quadraticCurveTo(cx + w / 2 + 2, h * 0.62, cx + w * 0.22, 0);
  g.lineTo(cx - w * 0.22, 0);
  g.quadraticCurveTo(cx - w / 2 - 2, h * 0.62, cx, h + 2);
  g.fill();
  g.restore();
  // the glowing body: bright at the head (bottom), fading to the tail (top)
  const body = g.createLinearGradient(0, 0, 0, h);
  body.addColorStop(0, 'rgba(0,0,0,0)');
  body.addColorStop(0.45, edge);
  body.addColorStop(0.8, mid);
  body.addColorStop(1, core);
  g.shadowColor = mid;
  g.shadowBlur = 10;
  g.fillStyle = body;
  g.beginPath();
  g.moveTo(cx, h);
  g.quadraticCurveTo(cx + w / 2, h * 0.62, cx + w * 0.16, 1);
  g.lineTo(cx - w * 0.16, 1);
  g.quadraticCurveTo(cx - w / 2, h * 0.62, cx, h);
  g.fill();
  // the white-hot head
  g.shadowBlur = 6;
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.ellipse(cx, h * 0.8, w * 0.18, h * 0.12, 0, 0, Math.PI * 2);
  g.fill();
}


export function foeLook(kind, armed = false) {
  switch (kind) {
    case 'green':
      // An ion shot: a green dart with two rings of energy round it.
      return made2d('foe|green', 30, 46, (g) => {
        g.translate(7, 6);
        dart(g, 16, 32, '#ffffff', '#6dff94', 'rgba(77,255,124,0.5)');
        g.strokeStyle = '#c8ffd6';
        g.lineWidth = 1.5;
        g.shadowColor = '#4dff7c';
        g.shadowBlur = 6;
        for (const y of [14, 20]) { g.beginPath(); g.ellipse(8, y, 7, 2, 0, 0, Math.PI * 2); g.stroke(); }
      });
    case 'plasma':
      // A plasma torpedo: a violet-white core in a cage of energy rings.
      return made2d('foe|plasma', 54, 54, (g) => {
        const c = 27;
        const glow = g.createRadialGradient(c, c, 0, c, c, 20);
        glow.addColorStop(0, '#ffffff');
        glow.addColorStop(0.3, '#f0d8ff');
        glow.addColorStop(0.6, '#b05cff');
        glow.addColorStop(1, 'rgba(58,10,110,0)');
        g.shadowColor = '#b05cff';
        g.shadowBlur = 14;
        g.fillStyle = glow;
        g.beginPath(); g.arc(c, c, 20, 0, Math.PI * 2); g.fill();
        g.shadowBlur = 0;
        g.strokeStyle = 'rgba(10, 4, 14, 0.85)';
        g.lineWidth = 2;
        g.beginPath(); g.arc(c, c, 11, 0, Math.PI * 2); g.stroke();
      });
    case 'bolt':
      // A lightning bolt shot: a jagged violet-white streak.
      return made2d('foe|bolt', 28, 48, (g) => {
        g.translate(14, 6);
        const pts = [[0, 0], [5, 8], [-4, 14], [5, 22], [-3, 28], [0, 36]];
        for (const [w, c, blur] of [[7, 'rgba(10,4,14,0.85)', 0], [5, '#b05cff', 10], [2, '#ffffff', 0]]) {
          g.strokeStyle = c; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round';
          g.shadowColor = '#b05cff'; g.shadowBlur = blur;
          g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
        }
      });
    case 'red':
      // A laser: a hard red needle. Can't be shot down.
      return made2d('foe|red', 24, 46, (g) => {
        g.translate(8, 8);
        g.shadowColor = '#ff3b3b';
        g.shadowBlur = 8;
        g.fillStyle = 'rgba(30, 0, 6, 0.9)';
        g.fillRect(-1, -1, 10, 32);
        bolt(g, 8, 30, '#ff3b3b');
      });
    case 'bullet':
      // A tracer: small, hot pink-red, quick.
      return made2d('foe|bullet', 18, 30, (g) => {
        g.translate(6, 7);
        g.shadowColor = '#ff2a4a';
        g.shadowBlur = 6;
        g.fillStyle = 'rgba(30, 0, 10, 0.9)';
        g.fillRect(-1, -1, 8, 18);
        bolt(g, 6, 16, '#ff2a6a', '#ffd0e0');
      });
    case 'rocket':
      return made2d('foe|rocket', 26, 44, (g) => {
        g.translate(7, 7);
        const body = g.createLinearGradient(0, 0, 0, 30);
        body.addColorStop(0, '#3a3f56'); body.addColorStop(0.2, '#3a3f56');
        body.addColorStop(0.2, '#8a90a8'); body.addColorStop(0.45, '#8a90a8');
        body.addColorStop(0.45, '#3a3f56'); body.addColorStop(0.75, '#3a3f56');
        body.addColorStop(0.75, '#ff3b3b'); body.addColorStop(1, '#ff3b3b');
        g.fillStyle = body;
        g.strokeStyle = '#10121e';
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(0, 0); g.lineTo(12, 0); g.lineTo(12, 22);
        g.quadraticCurveTo(12, 30, 6, 30); g.quadraticCurveTo(0, 30, 0, 22); g.closePath();
        g.fill(); g.stroke();
        // fins
        g.fillStyle = '#5a6078';
        g.fillRect(-3, 0, 3, 7); g.fillRect(12, 0, 3, 7);
      });
    case 'mine':
      return made2d(`foe|mine|${armed}`, 46, 46, (g) => {
        const c = 23;
        g.strokeStyle = '#3a3f56';
        g.lineWidth = 4;
        g.lineCap = 'round';
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          g.beginPath();
          g.moveTo(c + Math.cos(a) * 12, c + Math.sin(a) * 12);
          g.lineTo(c + Math.cos(a) * 19, c + Math.sin(a) * 19);
          g.stroke();
        }
        const body = g.createRadialGradient(c - 4, c - 4, 1, c, c, 14);
        body.addColorStop(0, '#8a90a8'); body.addColorStop(0.5, '#3a3f56'); body.addColorStop(1, '#10121e');
        g.fillStyle = body;
        g.beginPath(); g.arc(c, c, 14, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#05070f'; g.lineWidth = 2; g.stroke();
        g.shadowColor = '#ff3b3b';
        g.shadowBlur = armed ? 20 : 6;
        g.fillStyle = armed ? '#ffffff' : '#ff3b3b';
        g.beginPath(); g.arc(c, c, armed ? 6 : 4, 0, Math.PI * 2); g.fill();
      });
    case 'flak':
      // A flak shell: a dark metal ball with a hot yellow band.
      return made2d(`foe|flak|${armed}`, 30, 30, (g) => {
        const c = 15;
        const body = g.createRadialGradient(c - 4, c - 4, 1, c, c, 10);
        body.addColorStop(0, '#9aa0b8'); body.addColorStop(0.6, '#3a3f56'); body.addColorStop(1, '#10121e');
        g.fillStyle = body;
        g.beginPath(); g.arc(c, c, 10, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#05070f'; g.lineWidth = 2; g.stroke();
        g.shadowColor = '#ffd23f'; g.shadowBlur = 8;
        g.strokeStyle = armed ? '#ffffff' : '#ffd23f'; g.lineWidth = 3;
        g.beginPath(); g.ellipse(c, c, 10, 3.5, 0, 0, Math.PI * 2); g.stroke();
      });
    case 'shard':
      return made2d('foe|shard', 14, 22, (g) => { g.translate(3, 2); dart(g, 8, 16, '#ffffff', '#ffd23f', 'rgba(255,154,42,0.55)'); });
    case 'frost':
      return made2d('foe|frost', 16, 24, (g) => { g.translate(3, 2); dart(g, 10, 18, '#ffffff', '#bfe8ff', 'rgba(120,200,255,0.55)'); });
    case 'ice':
      // An icicle: a long pale-blue crystal, white down the middle.
      return made2d('foe|ice', 24, 46, (g) => {
        g.translate(12, 4);
        g.shadowColor = '#7fd4ff'; g.shadowBlur = 10;
        const body = g.createLinearGradient(-8, 0, 8, 0);
        body.addColorStop(0, '#5aa8e0'); body.addColorStop(0.45, '#e8f8ff'); body.addColorStop(0.55, '#ffffff'); body.addColorStop(1, '#7fc0f0');
        g.fillStyle = body;
        g.strokeStyle = 'rgba(10, 20, 40, 0.9)'; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(0, 38); g.lineTo(8, 10); g.lineTo(3, 0); g.lineTo(-3, 0); g.lineTo(-8, 10); g.closePath();
        g.fill(); g.shadowBlur = 0; g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(0, 2); g.lineTo(0, 34); g.stroke();
      });
    case 'slag':
      // A glob of melted rock: dark crust over glowing orange.
      return made2d('foe|slag', 40, 40, (g) => {
        const c = 20;
        g.shadowColor = '#ff7a1a'; g.shadowBlur = 14;
        const hot = g.createRadialGradient(c, c, 2, c, c, 14);
        hot.addColorStop(0, '#fff6c0'); hot.addColorStop(0.4, '#ffb030'); hot.addColorStop(1, '#c03a10');
        g.fillStyle = hot;
        g.beginPath();
        for (let i = 0; i <= 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          const r = 12 + Math.sin(i * 2.7) * 2.5;
          if (i) g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r); else g.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r);
        }
        g.fill();
        g.shadowBlur = 0;
        g.fillStyle = 'rgba(40, 18, 10, 0.85)';
        for (const [x, y, r] of [[-5, -5, 4], [5, -2, 3], [-1, 6, 3.5], [6, 6, 2]]) { g.beginPath(); g.arc(c + x, c + y, r, 0, Math.PI * 2); g.fill(); }
        g.strokeStyle = '#2a1008'; g.lineWidth = 1.5;
        g.beginPath(); g.arc(c, c, 13, 0, Math.PI * 2); g.stroke();
      });
    case 'ember':
      return made2d('foe|ember', 18, 18, (g) => {
        const glow = g.createRadialGradient(9, 9, 0, 9, 9, 8);
        glow.addColorStop(0, '#ffffff'); glow.addColorStop(0.35, '#ffd23f'); glow.addColorStop(0.7, '#ff7a1a'); glow.addColorStop(1, 'rgba(255,59,26,0)');
        g.fillStyle = glow;
        g.beginPath(); g.arc(9, 9, 8, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(40, 10, 4, 0.9)'; g.lineWidth = 1.2;
        g.beginPath(); g.arc(9, 9, 4.5, 0, Math.PI * 2); g.stroke();
      });
    default:
      // An energy dart: pink and white, pointed.
      return made2d('foe|pink', 26, 44, (g) => {
        g.translate(7, 6);
        dart(g, 12, 30, '#ffffff', '#ff5ab8', 'rgba(255,63,164,0.55)');
      });
  }
}
