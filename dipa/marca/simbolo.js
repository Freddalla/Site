/* =====================================================================
   DIPA · o símbolo (Meio sol)
   O sol pousado na água parada: metade luz, metade reflexo. Fonte única:
   todas as páginas desenham o símbolo por aqui. Trocar aqui troca em tudo.
   dipaSimbolo({ fundo: 'escuro' | 'claro' | null, grao: true|false, girar: true|false })
   ===================================================================== */
const DIPA_CORES = { noite:'#0f1d25', centro:'#1c3541', borda:'#0a131a', gelo:'#e9eff1', lume:'#f6c784', brasa:'#e0702e', brasaTinta:'#b8561c' };
let _dipaUid = 0;
/* true quando a página está no tema claro (escolha do aparelho ou do botão de tema) */
function dipaTemaClaro(){ try { const t = document.documentElement.dataset.theme; return t === 'light' || (!t && matchMedia('(prefers-color-scheme: light)').matches); } catch(e){ return false; } }
/* Meio sol: metade de cima acesa (o sol sobre a água), metade de baixo o reflexo.
   Calmo por fora, aceso por dentro. */
function dipaSimbolo(o = {}){
  const i = 'dp' + (++_dipaUid), fundo = o.fundo || null, claro = fundo === 'claro' || (!fundo && o.auto && dipaTemaClaro());
  const traco = claro ? DIPA_CORES.noite : DIPA_CORES.gelo;
  const bg = fundo === 'escuro'
    ? `<rect width="200" height="200" fill="url(#${i}b)"/>`
    : fundo === 'claro' ? `<rect width="200" height="200" fill="${DIPA_CORES.gelo}"/>` : '';
  const grao = o.grao && fundo ? `<rect width="200" height="200" filter="url(#${i}g)" opacity="${claro ? .08 : .12}"/>` : '';
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dipa"${o.classe ? ` class="${o.classe}"` : ''}><defs>
<radialGradient id="${i}b" cx="50%" cy="44%" r="72%"><stop offset="0%" stop-color="${DIPA_CORES.centro}"/><stop offset="100%" stop-color="${DIPA_CORES.borda}"/></radialGradient>
<radialGradient id="${i}s" cx="50%" cy="100%" r="100%"><stop offset="0%" stop-color="${DIPA_CORES.lume}"/><stop offset="75%" stop-color="${DIPA_CORES.brasa}"/></radialGradient>
<radialGradient id="${i}h" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${DIPA_CORES.brasa}" stop-opacity="${claro ? .22 : .42}"/><stop offset="100%" stop-color="${DIPA_CORES.brasa}" stop-opacity="0"/></radialGradient>
<filter id="${i}g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 ${claro ? 0 : 1}  0 0 0 0 ${claro ? 0 : 1}  0 0 0 0 ${claro ? 0 : 1}  0 0 0 .5 0"/></filter></defs>
${bg}<circle cx="100" cy="100" r="74" fill="url(#${i}h)"/>
<path d="M56 104 A44 44 0 0 1 144 104 Z" fill="url(#${i}s)"/>
<line x1="40" y1="104" x2="160" y2="104" stroke="${traco}" stroke-width="5" stroke-linecap="round"/>
<path d="M56 104 A44 44 0 0 0 144 104" fill="none" stroke="${traco}" stroke-width="5" stroke-linecap="round" opacity="${claro ? .35 : .38}"/>${grao}</svg>`;
}
/* desenha o símbolo num canvas 2D (fundos de tela e imagens geradas) */
function dipaSimboloCanvas(x, cx, cy, tam, cor = DIPA_CORES.gelo){
  const s = tam / 200, ox = cx - tam / 2, oy = cy - tam / 2, X = v => ox + v * s, Y = v => oy + v * s;
  x.save();
  const h = x.createRadialGradient(X(100), Y(100), 0, X(100), Y(100), 74 * s); h.addColorStop(0, 'rgba(224,112,46,.42)'); h.addColorStop(1, 'rgba(224,112,46,0)');
  x.fillStyle = h; x.beginPath(); x.arc(X(100), Y(100), 74 * s, 0, Math.PI * 2); x.fill();
  const g = x.createRadialGradient(X(100), Y(104), 0, X(100), Y(104), 58 * s); g.addColorStop(0, DIPA_CORES.lume); g.addColorStop(.75, DIPA_CORES.brasa); g.addColorStop(1, DIPA_CORES.brasa);
  x.fillStyle = g; x.beginPath(); x.arc(X(100), Y(104), 44 * s, Math.PI, Math.PI * 2); x.closePath(); x.fill();
  x.strokeStyle = cor; x.lineWidth = 5 * s; x.lineCap = 'round';
  x.beginPath(); x.moveTo(X(40), Y(104)); x.lineTo(X(160), Y(104)); x.stroke();
  x.globalAlpha *= .38; x.beginPath(); x.arc(X(100), Y(104), 44 * s, 0, Math.PI); x.stroke();
  x.restore();
}
/* ícone do navegador */
function dipaFavicon(){
  try { const l = document.createElement('link'); l.rel = 'icon'; l.type = 'image/svg+xml';
    l.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(dipaSimbolo({ fundo:'escuro' })); document.head.appendChild(l); } catch(e){}
}
