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

function orb(g, size, core, mid, rim) {
  const r = size / 2;
  const c = size / 2 + 8;
  const grad = g.createRadialGradient(c, c, 0, c, c, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, core);
  grad.addColorStop(0.65, mid);
  grad.addColorStop(1, rim);
  g.shadowColor = mid;
  g.shadowBlur = 10;
  g.fillStyle = grad;
  g.beginPath();
  g.arc(c, c, r, 0, Math.PI * 2);
  g.fill();
  g.shadowBlur = 0;
  // A dark outline, so it shows up on snow and sunsets too.
  g.strokeStyle = 'rgba(10, 4, 14, 0.85)';
  g.lineWidth = 2;
  g.stroke();
}

export function foeLook(kind, armed = false) {
  switch (kind) {
    case 'green':
      return made2d('foe|green', 38, 38, (g) => orb(g, 22, '#c8ffd6', '#4dff7c', '#0a5a22'));
    case 'plasma':
      // A big slow ball of violet fire.
      return made2d('foe|plasma', 50, 50, (g) => orb(g, 34, '#f0d8ff', '#b05cff', '#3a0a6e'));
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
        g.shadowColor = '#ff2a6a';
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
    default:
      return made2d('foe|pink', 36, 36, (g) => orb(g, 20, '#ffc2e4', '#ff3fa4', '#6a0838'));
  }
}
