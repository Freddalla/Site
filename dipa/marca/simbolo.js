/* =====================================================================
   DIPA · o símbolo (Atol)
   Uma ilha em anel e a lâmpada acesa a 45°. Fonte única: todas as páginas
   desenham o símbolo por aqui.
   dipaSimbolo({ fundo: 'escuro' | 'claro' | null, grao: true|false, girar: true|false })
   ===================================================================== */
const DIPA_CORES = { noite:'#0f1d25', centro:'#1c3541', borda:'#0a131a', gelo:'#e9eff1', lume:'#f6c784', brasa:'#e0702e', brasaTinta:'#b8561c' };
let _dipaUid = 0;
function dipaSimbolo(o = {}){
  const i = 'dp' + (++_dipaUid), fundo = o.fundo || null, claro = fundo === 'claro';
  const anel = claro ? DIPA_CORES.noite : DIPA_CORES.gelo;
  const bg = fundo === 'escuro'
    ? `<rect width="200" height="200" fill="url(#${i}b)"/>`
    : claro ? `<rect width="200" height="200" fill="${DIPA_CORES.gelo}"/>` : '';
  const grao = o.grao && fundo ? `<rect width="200" height="200" filter="url(#${i}g)" opacity="${claro ? .08 : .12}"/>` : '';
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dipa"${o.classe ? ` class="${o.classe}"` : ''}><defs>
<radialGradient id="${i}b" cx="50%" cy="44%" r="72%"><stop offset="0%" stop-color="${DIPA_CORES.centro}"/><stop offset="100%" stop-color="${DIPA_CORES.borda}"/></radialGradient>
<radialGradient id="${i}l" cx="38%" cy="35%" r="70%"><stop offset="0%" stop-color="${DIPA_CORES.lume}"/><stop offset="80%" stop-color="${DIPA_CORES.brasa}"/></radialGradient>
<radialGradient id="${i}h" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${DIPA_CORES.brasa}" stop-opacity="${claro ? .3 : .55}"/><stop offset="100%" stop-color="${DIPA_CORES.brasa}" stop-opacity="0"/></radialGradient>
<filter id="${i}g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 ${claro ? 0 : 1}  0 0 0 0 ${claro ? 0 : 1}  0 0 0 0 ${claro ? 0 : 1}  0 0 0 .5 0"/></filter></defs>
${bg}<g${o.girar ? ' class="dipa-gira"' : ''}><path d="M148.53 76.33 A54 54 0 1 1 123.67 51.47" fill="none" stroke="${anel}" stroke-width="5" stroke-linecap="round"/>
<circle cx="138.18" cy="61.82" r="27" fill="url(#${i}h)"/><circle cx="138.18" cy="61.82" r="8.5" fill="url(#${i}l)"/></g>${grao}</svg>`;
}
/* desenha o símbolo num canvas 2D (para fundos de tela e imagens geradas) */
function dipaSimboloCanvas(x, cx, cy, tam, cor = DIPA_CORES.gelo){
  const s = tam / 200, ox = cx - tam / 2, oy = cy - tam / 2, P = (a, b) => [ox + a * s, oy + b * s];
  x.save();
  x.strokeStyle = cor; x.lineWidth = 5 * s; x.lineCap = 'round';
  x.beginPath(); x.arc(ox + 100 * s, oy + 100 * s, 54 * s, (64 - 90) * Math.PI / 180, (26 - 90 + 360) * Math.PI / 180); x.stroke();
  const [lx, ly] = P(138.18, 61.82);
  const h = x.createRadialGradient(lx, ly, 0, lx, ly, 27 * s); h.addColorStop(0, 'rgba(224,112,46,.55)'); h.addColorStop(1, 'rgba(224,112,46,0)');
  x.fillStyle = h; x.beginPath(); x.arc(lx, ly, 27 * s, 0, Math.PI * 2); x.fill();
  const l = x.createRadialGradient(lx - 3 * s, ly - 3 * s, 0, lx, ly, 8.5 * s); l.addColorStop(0, DIPA_CORES.lume); l.addColorStop(1, DIPA_CORES.brasa);
  x.fillStyle = l; x.beginPath(); x.arc(lx, ly, 8.5 * s, 0, Math.PI * 2); x.fill();
  x.restore();
}
/* ícone do navegador */
function dipaFavicon(){
  try { const l = document.createElement('link'); l.rel = 'icon'; l.type = 'image/svg+xml';
    l.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(dipaSimbolo({ fundo:'escuro' })); document.head.appendChild(l); } catch(e){}
}
