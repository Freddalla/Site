/* =====================================================================
   CLÍNICA · aplicativo
   Telas: Início · Pacientes · Lançar (+) · Lançamentos · Resumo · Ajustes
   Tudo fica guardado só neste aparelho (IndexedDB). Backup criptografado em Ajustes.
   ===================================================================== */
import * as db from './db.js';
import {
  CATEGORIAS, CATEGORIA, PROCEDIMENTOS_PADRAO, AREAS, PAGAMENTOS, FIXOS_PADRAO, MENSAGEM_PADRAO,
  brl, brlCurto, pct, numeroDe, hoje, somaDias, somaMeses, diasEntre, mesDe, nomeMes, nomeMesCurto, somaMesYM,
  dataCurta, dataLonga, quando, textoPrazo, semAcento, primeiroNome, telefoneWhats, telefoneBonito, contasDoMes, dataDe
} from './dados.js';
import { interpretar } from './interpretador.js';

/* ---------- estado ---------- */
const E = { pacientes: [], atendimentos: [], despesas: [], fixos: [], anexos: [], aj: {} };
const UI = { mesLanc: mesDe(hoje()), mesResumo: mesDe(hoje()), filtroLanc: 'tudo', buscaPac: '', filtroPac: 'todos' };
const AJ_PADRAO = {
  procedimentos: PROCEDIMENTOS_PADRAO,
  taxas: Object.fromEntries(PAGAMENTOS.map(p => [p.id, p.taxa])),
  mensagem: MENSAGEM_PADRAO,
  iaLigada: false, chaveIA: '', senhaBackup: '', ultimoBackup: null, pinHash: null,
  instalarDispensado: false, fixosIniciados: false
};
const ativos = lista => lista.filter(x => !x.excluido);
const procs = () => E.aj.procedimentos.filter(p => !p.oculto);
const proc = id => E.aj.procedimentos.find(p => p.id === id) || { id, nome: id || 'Atendimento', area: 'odonto', retornoDias: 180 };
const paciente = id => E.pacientes.find(p => p.id === id) || { nome: 'Paciente', telefone: '' };
const anexosDe = donoId => E.anexos.filter(a => a.donoId === donoId && !a.excluido);

async function carregar() {
  for (const t of ['pacientes', 'atendimentos', 'despesas', 'fixos', 'anexos']) E[t] = await db.todos(t);
  const ajustes = await db.todos('ajustes');
  E.aj = { ...AJ_PADRAO };
  for (const a of ajustes) E.aj[a.id] = a.valor;
  /* procedimentos novos que vierem em versões futuras entram sem apagar os editados */
  const ids = new Set(E.aj.procedimentos.map(p => p.id));
  for (const p of PROCEDIMENTOS_PADRAO) if (!ids.has(p.id)) E.aj.procedimentos.push(p);
}
async function ajustar(chave, valor) { E.aj[chave] = valor; await db.gravarAjuste(chave, valor); }

/* ---------- utilidades de tela ---------- */
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tela = $('#tela');
const ICONE_AREA = { estetica: '✨', odonto: '🦷' };
const SVG_WHATS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4.1-4.9-4.3-.1-.2-1.2-1.5-1.2-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.6 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>';
const SVG_MAIS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>';
const SVG_CLIPE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7L10.2 17a1.7 1.7 0 0 1-2.4-2.4L15.5 7"/></svg>';
const SVG_ESQ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>';
const SVG_DIR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
const SVG_MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const SVG_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const SVG_BUSCA = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

let tempoAviso;
function aviso(msg, { rotulo, acao, tempo = 4200 } = {}) {
  const el = $('#aviso');
  el.innerHTML = `<p>${esc(msg)}</p>${rotulo ? `<button type="button">${esc(rotulo)}</button>` : ''}`;
  el.hidden = false;
  if (rotulo) $('button', el).onclick = () => { el.hidden = true; acao?.(); };
  clearTimeout(tempoAviso);
  tempoAviso = setTimeout(() => { el.hidden = true; }, rotulo ? Math.max(tempo, 8000) : tempo);
}

/* folha que sobe de baixo; o botão "voltar" do celular fecha a folha */
let folhaAberta = false;
/* dentro de um quadro (prévia), o histórico é o da página de fora: não mexe nele */
const usaHistorico = (() => { try { return window.self === window.top; } catch { return false; } })();
function abrirFolha(html, montar) {
  const folha = $('#folha');
  folha.innerHTML = `<div class="folha-alca"></div>${html}`;
  folha.hidden = false; $('#fundo').hidden = false;
  document.body.style.overflow = 'hidden';
  if (!folhaAberta) { if (usaHistorico) history.pushState({ folha: true }, ''); folhaAberta = true; }
  folha.scrollTop = 0;
  montar?.(folha);
  return folha;
}
function fecharFolha({ doHistorico = false } = {}) {
  if (!folhaAberta) return;
  folhaAberta = false;
  $('#folha').hidden = true; $('#fundo').hidden = true; $('#folha').innerHTML = '';
  document.body.style.overflow = '';
  if (usaHistorico && !doHistorico && history.state?.folha) history.back();
}
window.addEventListener('popstate', () => { if (folhaAberta) fecharFolha({ doHistorico: true }); });
$('#fundo').addEventListener('click', () => fecharFolha());

const topoFolha = (titulo, passo = '') => `<div class="folha-topo"><div><h2>${titulo}</h2>${passo ? `<span class="passo">${passo}</span>` : ''}</div><button class="icone-btn" data-acao="fechar" aria-label="Fechar">${SVG_X}</button></div>`;

function confirmar(pergunta, { sim = 'Sim', perigo = false } = {}) {
  return new Promise(ok => {
    abrirFolha(`${topoFolha(esc(pergunta))}
      <div class="botoes"><button class="btn secundario" data-r="0">Cancelar</button><button class="btn ${perigo ? 'perigo' : 'primario'}" data-r="1">${esc(sim)}</button></div>`,
    f => $$('[data-r]', f).forEach(b => b.onclick = () => { const r = b.dataset.r === '1'; fecharFolha(); ok(r); }));
  });
}

/* ---------- navegação ---------- */
const TELAS = { inicio: telaInicio, pacientes: telaPacientes, lancamentos: telaLancamentos, resumo: telaResumo, ajustes: telaAjustes };
function render() {
  const aba = location.hash.slice(1) || 'inicio';
  const fn = TELAS[aba] || telaInicio;
  $$('.abas a').forEach(a => { if (a.dataset.aba === aba) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  tela.innerHTML = fn();
  montarTela(aba);
  atualizarSelo();
}
window.addEventListener('hashchange', () => { if (folhaAberta) fecharFolha({ doHistorico: true }); render(); window.scrollTo(0, 0); });
$('#btn-ajustes').onclick = () => { location.hash = 'ajustes'; };
$('#btn-lancar').onclick = () => folhaLancar();

/* cliques com data-acao, em qualquer lugar */
const ACOES = {};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-acao]');
  if (!el) return;
  const fn = ACOES[el.dataset.acao];
  if (fn) fn(el.dataset, el, e);
});
ACOES.fechar = () => fecharFolha();
ACOES.ir = d => { location.hash = d.para; };

/* ---------- retornos ---------- */
function retornosPendentes() {
  return ativos(E.atendimentos).filter(a => a.retorno && !a.retornoFeito && !paciente(a.pacienteId).excluido)
    .sort((a, b) => a.retorno.localeCompare(b.retorno));
}
function mensagemPara(a) {
  const p = paciente(a.pacienteId);
  return (E.aj.mensagem || MENSAGEM_PADRAO).replaceAll('{nome}', primeiroNome(p.nome)).replaceAll('{procedimento}', proc(a.procedimento).nome.toLowerCase());
}
function linkWhats(a) {
  const tel = telefoneWhats(paciente(a.pacienteId).telefone);
  return tel ? `https://wa.me/${tel}?text=${encodeURIComponent(mensagemPara(a))}` : '';
}
function htmlRetorno(a) {
  const p = paciente(a.pacienteId), pr = proc(a.procedimento);
  const d = diasEntre(hoje(), a.retorno);
  const tag = a.whatsEm ? `<span class="pilula bom">mensagem enviada ${a.whatsEm === hoje() ? 'hoje' : dataCurta(a.whatsEm)}</span>`
    : d < 0 ? `<span class="pilula critico">atrasado ${-d} ${-d === 1 ? 'dia' : 'dias'}</span>`
    : d === 0 ? '<span class="pilula alerta">hoje</span>' : `<span class="pilula neutra">${quando(a.retorno)}</span>`;
  const link = linkWhats(a);
  const principal = a.whatsEm
    ? `<button class="btn pequeno secundario" data-acao="retorno-feito" data-id="${a.id}">✓ Feito</button>`
    : link ? `<a class="btn-whats" href="${esc(link)}" target="_blank" rel="noopener" data-acao="whats" data-id="${a.id}" aria-label="Mandar WhatsApp">${SVG_WHATS}<span>WhatsApp</span></a>`
    : `<button class="btn pequeno secundario" data-acao="paciente" data-id="${a.pacienteId}">Pôr telefone</button>`;
  return `<div class="retorno">
    <div class="item-icone">${ICONE_AREA[pr.area] || '🦷'}</div>
    <div class="item-meio" data-acao="paciente" data-id="${a.pacienteId}">
      <div class="item-titulo">${esc(p.nome)}</div>
      <div class="item-sub">${esc(pr.nome)} · em ${dataCurta(a.data)}</div>
      <div style="margin-top:4px">${tag}</div>
    </div>
    <div class="acoes">${principal}<button class="btn-redondo" data-acao="retorno-opcoes" data-id="${a.id}" aria-label="Mais opções">${SVG_MAIS}</button></div>
  </div>`;
}
ACOES.whats = async d => {
  const a = E.atendimentos.find(x => x.id === d.id);
  /* deixa o link abrir o WhatsApp e marca que a mensagem foi enviada */
  setTimeout(async () => { await salvarEm('atendimentos', { ...a, whatsEm: hoje() }); render(); }, 400);
};
ACOES['retorno-feito'] = async d => {
  const a = E.atendimentos.find(x => x.id === d.id);
  await salvarEm('atendimentos', { ...a, retornoFeito: true, retornoFeitoEm: hoje() });
  render();
  aviso('Retorno marcado como feito.', { rotulo: 'Desfazer', acao: async () => { await salvarEm('atendimentos', { ...a }); render(); } });
};
ACOES['retorno-opcoes'] = d => {
  const a = E.atendimentos.find(x => x.id === d.id);
  const p = paciente(a.pacienteId);
  abrirFolha(`${topoFolha(esc(p.nome), `Retorno ${quando(a.retorno)} · ${dataLonga(a.retorno)}`)}
    <div class="cartao"><ul class="lista">
      <li><button class="item" data-acao="retorno-feito" data-id="${a.id}"><div class="item-icone">✓</div><div class="item-meio"><div class="item-titulo">Já falei com o paciente</div><div class="item-sub">Sai da lista de retornos</div></div></button></li>
      <li><button class="item" data-acao="retorno-adiar" data-id="${a.id}"><div class="item-icone">⏭️</div><div class="item-meio"><div class="item-titulo">Mudar a data</div><div class="item-sub">Adiar ou adiantar o retorno</div></div></button></li>
      <li><button class="item" data-acao="agenda" data-id="${a.id}"><div class="item-icone">📅</div><div class="item-meio"><div class="item-titulo">Pôr na agenda do celular</div><div class="item-sub">O celular avisa no dia, mesmo com o app fechado</div></div></button></li>
      <li><button class="item" data-acao="paciente" data-id="${a.pacienteId}"><div class="item-icone">👤</div><div class="item-meio"><div class="item-titulo">Ver paciente</div><div class="item-sub">Histórico e telefone</div></div></button></li>
    </ul></div>`);
};
ACOES['retorno-adiar'] = d => {
  const a = E.atendimentos.find(x => x.id === d.id);
  const base = hoje();
  const opcoes = [[7, '1 semana'], [15, '15 dias'], [30, '1 mês'], [90, '3 meses'], [180, '6 meses']];
  abrirFolha(`${topoFolha('Nova data do retorno')}
    <label class="campo"><span>Data</span><input type="date" id="nova-data" value="${a.retorno}"></label>
    <div class="opcoes">${opcoes.map(([n, t]) => `<button class="chip" data-dias="${n}">daqui a ${t}</button>`).join('')}</div>
    <div class="botoes"><button class="btn primario" id="salvar-data">Salvar</button></div>`, f => {
    $$('[data-dias]', f).forEach(b => b.onclick = () => { $('#nova-data', f).value = somaDias(base, +b.dataset.dias); });
    $('#salvar-data', f).onclick = async () => {
      const v = $('#nova-data', f).value; if (!v) return;
      await salvarEm('atendimentos', { ...a, retorno: v, whatsEm: null, retornoFeito: false });
      fecharFolha(); render(); aviso(`Retorno para ${dataLonga(v)}.`, { rotulo: '📅 Agenda', acao: () => porNaAgenda(a.id) });
    };
  });
};
ACOES.agenda = d => porNaAgenda(d.id);

/* .ics para o iPhone; Google Agenda para Android e computador */
const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function porNaAgenda(atendimentoId) {
  const a = E.atendimentos.find(x => x.id === atendimentoId);
  if (!a?.retorno) return;
  const nome = primeiroNome(paciente(a.pacienteId).nome);
  const titulo = `Retorno: ${nome} (mandar WhatsApp)`;
  const detalhe = `Abra o app Clínica e toque em WhatsApp para chamar ${nome}.`;
  const dia = a.retorno.replace(/-/g, '');
  if (ehIOS()) {
    const escICS = s => s.replace(/[\\;,]/g, m => '\\' + m);
    const carimbo = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Clinica Rebeca//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      `UID:${a.id}-${dia}@clinica`, `DTSTAMP:${carimbo}`, `DTSTART:${dia}T090000`, `DTEND:${dia}T091500`,
      `SUMMARY:${escICS(titulo)}`, `DESCRIPTION:${escICS(detalhe)}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escICS(titulo)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    baixar(new Blob([ics], { type: 'text/calendar' }), `retorno-${nome.toLowerCase()}.ics`);
  } else {
    const fim = somaDias(a.retorno, 0).replace(/-/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&details=${encodeURIComponent(detalhe)}&dates=${dia}T090000/${fim}T091500`;
    window.open(url, '_blank', 'noopener');
  }
  if (folhaAberta) fecharFolha();
}
function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: nome });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function atualizarSelo() {
  const n = retornosPendentes().filter(a => a.retorno <= hoje() && !a.whatsEm).length;
  const s = $('#selo-retornos');
  s.hidden = !n; s.textContent = n;
  try { n ? navigator.setAppBadge?.(n) : navigator.clearAppBadge?.(); } catch { /* sem selo no ícone */ }
}

/* ---------- salvar ---------- */
async function salvarEm(tabela, registro) {
  const r = await db.salvar(tabela, registro);
  const lista = E[tabela];
  const i = lista.findIndex(x => x.id === r.id);
  if (i >= 0) lista[i] = r; else lista.push(r);
  return r;
}
async function excluirDe(tabela, id) {
  const r = await db.excluir(tabela, id);
  const i = E[tabela].findIndex(x => x.id === id);
  if (i >= 0 && r) E[tabela][i] = r;
  for (const an of anexosDe(id)) await excluirDe('anexos', an.id);
}

/* =====================================================================
   INÍCIO
   ===================================================================== */
let eventoInstalar = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); eventoInstalar = e; });
const instalado = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function telaInicio() {
  const h = new Date().getHours();
  const saudacao = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const pend = retornosPendentes();
  const hojeLista = pend.filter(a => a.retorno <= hoje());
  const proximos = pend.filter(a => a.retorno > hoje() && a.retorno <= somaDias(hoje(), 7));
  const c = contasDoMes(mesDe(hoje()), E.atendimentos, E.despesas);
  const temDados = ativos(E.atendimentos).length + ativos(E.despesas).length > 0;
  const contas = ativos(E.despesas).filter(d => d.status === 'a_pagar' && (d.vencimento || d.data) <= somaDias(hoje(), 7))
    .sort((a, b) => (a.vencimento || a.data).localeCompare(b.vencimento || b.data));
  const receber = ativos(E.atendimentos).filter(a => a.status === 'a_receber').sort((a, b) => a.data.localeCompare(b.data));
  const faixas = [];
  if (window.CLINICA_DEMO) faixas.push('<div class="faixa alerta"><p><strong>Prévia com dados de exemplo</strong>Pacientes e valores são fictícios. Pode lançar, editar e apagar à vontade: fica só neste navegador.</p></div>');
  else if (!instalado() && !E.aj.instalarDispensado) {
    faixas.push(`<div class="faixa suave"><p><strong>Instale na tela inicial</strong>${ehIOS() ? 'No Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início". Assim os dados ficam guardados com segurança.' : 'Fica como um aplicativo e os dados ficam guardados com segurança.'}</p>
      ${eventoInstalar ? '<button class="btn pequeno primario" data-acao="instalar">Instalar</button>' : ''}<button class="icone-btn" data-acao="dispensar-instalar" aria-label="Dispensar">${SVG_X}</button></div>`);
  }
  if (temDados && !window.CLINICA_DEMO) {
    const dias = E.aj.ultimoBackup ? diasEntre(E.aj.ultimoBackup.slice(0, 10), hoje()) : null;
    if (dias === null || dias >= 7) {
      faixas.push(`<div class="faixa ${dias === null || dias >= 14 ? 'critico' : 'alerta'}"><p><strong>${dias === null ? 'Você ainda não fez backup' : `Último backup há ${dias} dias`}</strong>Os dados ficam só neste celular. Guarde uma cópia no Drive.</p><button class="btn pequeno primario" data-acao="backup">Fazer</button></div>`);
    }
  }
  return `
    <h1 class="titulo">${saudacao}, Rebeca <em>${new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</em></h1>
    ${faixas.join('')}
    <div class="secao"><h2>Retornos para falar hoje</h2>${pend.length ? `<a href="#pacientes" data-acao="ver-retornos">Ver todos (${pend.length})</a>` : ''}</div>
    <div class="cartao">${hojeLista.length ? hojeLista.map(htmlRetorno).join('') : `<div class="vazio"><strong>Nenhum retorno para hoje 🌿</strong>${proximos.length ? `${proximos.length} nos próximos 7 dias.` : 'Ao lançar um atendimento, o retorno é marcado sozinho.'}</div>`}</div>
    ${proximos.length ? `<div class="secao"><h2>Próximos 7 dias</h2></div><div class="cartao">${proximos.map(htmlRetorno).join('')}</div>` : ''}

    <div class="secao"><h2>${nomeMes(mesDe(hoje()))}</h2><a href="#resumo">Ver resumo</a></div>
    ${placar(c)}

    ${contas.length ? `<div class="secao"><h2>Contas a pagar</h2><a href="#lancamentos" data-acao="filtro-lanc" data-filtro="a_pagar">Ver todas</a></div>
      <div class="cartao"><ul class="lista">${contas.slice(0, 5).map(d => `<li>${htmlLancamento({ tipo: 'despesa', r: d })}</li>`).join('')}</ul></div>` : ''}
    ${receber.length ? `<div class="secao"><h2>A receber</h2><a href="#lancamentos" data-acao="filtro-lanc" data-filtro="a_receber">Ver todos</a></div>
      <div class="cartao"><ul class="lista">${receber.slice(0, 5).map(a => `<li>${htmlLancamento({ tipo: 'atendimento', r: a })}</li>`).join('')}</ul></div>` : ''}
    ${!temDados ? `<div class="cartao pad mt"><p><strong>Comece pelo botão + lá embaixo.</strong></p><p class="nota mt">Fale ou escreva do seu jeito: "atendi a Maria, botox, 1.500 no pix" ou "paguei 1.200 de aluguel". Também dá para tirar foto da nota ou do boleto.</p></div>` : ''}
  `;
}
function placar(c) {
  const sinal = c.lucro >= 0 ? 'positivo' : 'negativo';
  return `<a class="placar" href="#resumo" style="text-decoration:none">
    <div class="grande"><div class="rotulo">Lucro líquido ${Number.isFinite(c.margem) ? `<span class="pilula ${c.margem >= 0.3 ? 'bom' : c.margem >= 0 ? 'alerta' : 'critico'}">margem ${pct(c.margem)}</span>` : ''}</div>
      <div class="valor ${sinal}">${brl(c.lucro)}</div></div>
    <div><div class="rotulo"><i class="ponto receita"></i>Receita</div><div class="valor">${brlCurto(c.receita)}</div></div>
    <div><div class="rotulo"><i class="ponto despesa"></i>Despesas${c.taxas ? ' e taxas' : ''}</div><div class="valor">${brlCurto(c.despesa + c.taxas)}</div></div>
  </a>`;
}
ACOES.instalar = async () => { if (eventoInstalar) { eventoInstalar.prompt(); await eventoInstalar.userChoice; eventoInstalar = null; render(); } };
ACOES['dispensar-instalar'] = async () => { await ajustar('instalarDispensado', true); render(); };
ACOES['ver-retornos'] = () => { UI.filtroPac = 'retorno'; };
ACOES['filtro-lanc'] = d => { UI.filtroLanc = d.filtro; UI.mesLanc = mesDe(hoje()); };

/* =====================================================================
   LANÇAMENTOS
   ===================================================================== */
function htmlLancamento({ tipo, r }) {
  const clipe = anexosDe(r.id).length ? ' 📎' : '';
  if (tipo === 'atendimento') {
    const p = paciente(r.pacienteId), pr = proc(r.procedimento);
    const pag = PAGAMENTOS.find(x => x.id === r.pagamento);
    const st = r.status === 'a_receber' ? '<span class="pilula alerta">a receber</span>' : '';
    return `<button class="item" data-acao="editar-atendimento" data-id="${r.id}">
      <div class="item-icone receita">${ICONE_AREA[pr.area] || '🦷'}</div>
      <div class="item-meio"><div class="item-titulo">${esc(p.nome)}${clipe}</div><div class="item-sub">${esc(pr.nome)}${pag ? ' · ' + esc(pag.nome) + (r.parcelas ? ` ${r.parcelas}x` : '') : ''} · ${dataCurta(r.data)}</div></div>
      <div class="item-fim"><span class="item-valor receita">+ ${brl(r.valor)}</span>${st}</div></button>`;
  }
  const cat = CATEGORIA[r.categoria] || CATEGORIA.outros;
  const venc = r.vencimento || r.data;
  const st = r.status === 'a_pagar'
    ? `<span class="pilula ${venc < hoje() ? 'critico' : venc <= somaDias(hoje(), 3) ? 'alerta' : 'neutra'}">${venc < hoje() ? 'venceu ' : 'vence '}${dataCurta(venc)}</span>` : '';
  return `<button class="item" data-acao="editar-despesa" data-id="${r.id}">
    <div class="item-icone despesa">${cat.icone}</div>
    <div class="item-meio"><div class="item-titulo">${esc(r.descricao || cat.nome)}${clipe}</div><div class="item-sub">${esc(cat.nome)} · ${dataCurta(r.data)}</div></div>
    <div class="item-fim"><span class="item-valor">− ${brl(r.valor)}</span>${st}</div></button>`;
}
function navMes(chave, titulo) {
  const ym = UI[chave];
  return `<div class="mes">
    <button class="icone-btn" data-acao="mes" data-chave="${chave}" data-passo="-1" aria-label="Mês anterior">${SVG_ESQ}</button>
    <h1>${nomeMes(ym).replace(' de ', ' <small>de ')}${titulo ? ' · ' + titulo : ''}</small></h1>
    <button class="icone-btn" data-acao="mes" data-chave="${chave}" data-passo="1" aria-label="Próximo mês" ${ym >= mesDe(hoje()) ? 'disabled style="opacity:.3"' : ''}>${SVG_DIR}</button>
  </div>`;
}
ACOES.mes = d => { UI[d.chave] = somaMesYM(UI[d.chave], +d.passo); render(); };

function fixosPendentes(ym) {
  const doMes = ativos(E.despesas).filter(d => mesDe(d.data) === ym);
  const feitos = new Set(doMes.filter(d => d.fixoId).map(d => d.fixoId));
  /* se ela já lançou por voz ("paguei o aluguel"), não pede de novo */
  const mesmo = (f, d) => d.categoria === f.categoria && semAcento(d.descricao).includes(semAcento(f.descricao).split(' ')[0]);
  return ativos(E.fixos).filter(f => !feitos.has(f.id) && !doMes.some(d => !d.fixoId && mesmo(f, d)));
}
function telaLancamentos() {
  const ym = UI.mesLanc;
  const c = contasDoMes(ym, E.atendimentos, E.despesas);
  const filtros = [['tudo', 'Tudo'], ['receitas', 'Receitas'], ['despesas', 'Despesas'], ['a_pagar', 'A pagar'], ['a_receber', 'A receber'], ['fixas', 'Custos fixos']];
  const f = UI.filtroLanc;
  /* "a pagar" e "a receber" mostram tudo que está em aberto, de qualquer mês */
  const emAberto = f === 'a_pagar' || f === 'a_receber';
  let itens = [
    ...ativos(E.atendimentos).map(r => ({ tipo: 'atendimento', r, data: r.data })),
    ...ativos(E.despesas).map(r => ({ tipo: 'despesa', r, data: r.data }))
  ];
  if (!emAberto) itens = itens.filter(i => mesDe(i.data) === ym);
  itens = itens.filter(i => f === 'tudo' || (f === 'receitas' && i.tipo === 'atendimento') || (f === 'despesas' && i.tipo === 'despesa')
    || (f === 'a_pagar' && i.r.status === 'a_pagar') || (f === 'a_receber' && i.r.status === 'a_receber')
    || (f === 'fixas' && i.tipo === 'despesa' && CATEGORIA[i.r.categoria]?.grupo === 'fixa'));
  itens.sort((a, b) => b.data.localeCompare(a.data) || (b.r.criadoEm || '').localeCompare(a.r.criadoEm || ''));
  const grupos = [];
  for (const i of itens) { const g = grupos.at(-1); if (g && g.data === i.data) g.itens.push(i); else grupos.push({ data: i.data, itens: [i] }); }
  const pendFixos = fixosPendentes(ym);
  return `
    ${emAberto ? `<h1 class="titulo">${f === 'a_pagar' ? 'Contas a pagar' : 'A receber'}</h1>` : navMes('mesLanc')}
    ${emAberto ? '' : `<div class="placar tres">
      <div><div class="rotulo"><i class="ponto receita"></i>Entrou</div><div class="valor" style="font-size:16px">${brlCurto(c.receita)}</div></div>
      <div><div class="rotulo"><i class="ponto despesa"></i>Saiu</div><div class="valor" style="font-size:16px">${brlCurto(c.despesa + c.taxas)}</div></div>
      <div><div class="rotulo">Sobrou</div><div class="valor ${c.lucro >= 0 ? 'positivo' : 'negativo'}" style="font-size:16px">${brlCurto(c.lucro).replace('-', '−')}</div></div></div>`}
    <div class="chips" role="group" aria-label="Filtro">${filtros.map(([id, t]) => `<button class="chip" aria-pressed="${f === id}" data-acao="filtrar" data-filtro="${id}">${t}</button>`).join('')}</div>
    ${!emAberto && pendFixos.length && ym <= mesDe(hoje()) ? `<div class="faixa suave"><p><strong>Custos fixos de ${nomeMes(ym).split(' ')[0]}</strong>${pendFixos.length} ainda não ${pendFixos.length === 1 ? 'foi lançado' : 'foram lançados'} (${pendFixos.slice(0, 3).map(x => esc(x.descricao)).join(', ')}${pendFixos.length > 3 ? '…' : ''}).</p><button class="btn pequeno primario" data-acao="lancar-fixos" data-mes="${ym}">Lançar</button></div>` : ''}
    ${grupos.length ? grupos.map(g => `<div class="dia">${dataDe(g.data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
      <div class="cartao"><ul class="lista">${g.itens.map(i => `<li>${htmlLancamento(i)}</li>`).join('')}</ul></div>`).join('')
      : `<div class="cartao vazio"><strong>Nada por aqui</strong>Toque no + para lançar.</div>`}
    ${!emAberto && itens.length ? `<p class="nota centro mt"><button class="btn pequeno secundario" data-acao="csv" data-mes="${ym}">Baixar planilha do mês</button></p>` : ''}
  `;
}
ACOES.filtrar = d => { UI.filtroLanc = d.filtro; render(); };

/* Planilha (CSV) do mês, para o contador */
ACOES.csv = d => {
  const ym = d.mes;
  const linhas = [['Data', 'Tipo', 'Descrição', 'Categoria / procedimento', 'Valor', 'Taxa cartão', 'Situação', 'Pagamento', 'Vencimento']];
  const num = v => (Number(v) || 0).toFixed(2).replace('.', ',');
  for (const a of ativos(E.atendimentos).filter(x => mesDe(x.data) === ym)) {
    linhas.push([dataLonga(a.data), 'Receita', paciente(a.pacienteId).nome, proc(a.procedimento).nome, num(a.valor), num((a.valor || 0) * (a.taxa || 0) / 100),
      a.status === 'a_receber' ? 'A receber' : 'Recebido', PAGAMENTOS.find(p => p.id === a.pagamento)?.nome || '', '']);
  }
  for (const x of ativos(E.despesas).filter(x => mesDe(x.data) === ym)) {
    linhas.push([dataLonga(x.data), 'Despesa', x.descricao || '', CATEGORIA[x.categoria]?.nome || '', num(x.valor), '', x.status === 'a_pagar' ? 'A pagar' : 'Pago', '', dataLonga(x.vencimento)]);
  }
  const csv = '﻿' + linhas.map(l => l.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  baixar(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `clinica-${ym}.csv`);
};

/* =====================================================================
   PACIENTES
   ===================================================================== */
function telaPacientes() {
  const pend = retornosPendentes();
  const proxRetorno = new Map();
  for (const a of pend) if (!proxRetorno.has(a.pacienteId)) proxRetorno.set(a.pacienteId, a);
  const ultimo = new Map();
  for (const a of ativos(E.atendimentos)) { const u = ultimo.get(a.pacienteId); if (!u || a.data > u.data) ultimo.set(a.pacienteId, a); }
  const busca = semAcento(UI.buscaPac);
  let lista = ativos(E.pacientes).filter(p => !busca || semAcento(p.nome).includes(busca) || (p.telefone || '').includes(busca.replace(/\D/g, '') || '§'));
  if (UI.filtroPac === 'retorno') lista = lista.filter(p => proxRetorno.has(p.id)).sort((a, b) => proxRetorno.get(a.id).retorno.localeCompare(proxRetorno.get(b.id).retorno));
  else lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  return `
    <h1 class="titulo">Pacientes</h1>
    <div class="busca">${SVG_BUSCA}<input type="search" id="busca-pac" placeholder="Buscar por nome ou telefone" value="${esc(UI.buscaPac)}" autocomplete="off"></div>
    <div class="chips"><button class="chip" aria-pressed="${UI.filtroPac === 'todos'}" data-acao="filtro-pac" data-filtro="todos">Todos (${ativos(E.pacientes).length})</button>
      <button class="chip" aria-pressed="${UI.filtroPac === 'retorno'}" data-acao="filtro-pac" data-filtro="retorno">Com retorno marcado (${proxRetorno.size})</button>
      <button class="chip" data-acao="novo-paciente">＋ Novo paciente</button></div>
    ${UI.filtroPac === 'retorno' && pend.length ? `<div class="cartao">${pend.map(htmlRetorno).join('')}</div>` : lista.length ? `<div class="cartao"><ul class="lista">${lista.map(p => {
      const r = proxRetorno.get(p.id), u = ultimo.get(p.id);
      const tag = r ? (r.retorno <= hoje() ? '<span class="pilula alerta">falar hoje</span>' : `<span class="pilula neutra">retorno ${dataCurta(r.retorno)}</span>`) : '';
      return `<li><button class="item" data-acao="paciente" data-id="${p.id}">
        <div class="item-icone">${esc(p.nome.trim().charAt(0).toUpperCase() || '?')}</div>
        <div class="item-meio"><div class="item-titulo">${esc(p.nome)}</div><div class="item-sub">${u ? `${esc(proc(u.procedimento).nome)} · ${dataLonga(u.data)}` : esc(telefoneBonito(p.telefone)) || 'Sem atendimento ainda'}</div></div>
        <div class="item-fim">${tag}</div></button></li>`;
    }).join('')}</ul></div>` : `<div class="cartao vazio"><strong>${busca ? 'Ninguém com esse nome' : 'Nenhum paciente ainda'}</strong>Ao lançar um atendimento, o paciente é cadastrado junto.</div>`}
  `;
}
ACOES['filtro-pac'] = d => { UI.filtroPac = d.filtro; render(); };
ACOES['novo-paciente'] = () => formPaciente({});

ACOES.paciente = d => {
  const p = E.pacientes.find(x => x.id === d.id);
  if (!p) return;
  const hist = ativos(E.atendimentos).filter(a => a.pacienteId === p.id).sort((a, b) => b.data.localeCompare(a.data));
  const total = hist.reduce((s, a) => s + (a.valor || 0), 0);
  const tel = telefoneWhats(p.telefone);
  const r = retornosPendentes().find(a => a.pacienteId === p.id);
  abrirFolha(`${topoFolha(esc(p.nome), p.telefone ? esc(telefoneBonito(p.telefone)) : 'Sem telefone')}
    <div class="linha-flex" style="margin-bottom:14px">
      ${tel ? `<a class="btn-whats" href="https://wa.me/${tel}" target="_blank" rel="noopener">${SVG_WHATS}WhatsApp</a><a class="btn pequeno secundario" href="tel:+${tel}">Ligar</a>` : ''}
      <button class="btn pequeno secundario" data-acao="editar-paciente" data-id="${p.id}">Editar dados</button>
    </div>
    ${r ? `<div class="cartao" style="margin-bottom:12px">${htmlRetorno(r)}</div>` : ''}
    <div class="placar" style="margin-bottom:12px"><div><div class="rotulo">Atendimentos</div><div class="valor">${hist.length}</div></div><div><div class="rotulo">Total</div><div class="valor">${brlCurto(total)}</div></div></div>
    ${p.obs ? `<p class="nota" style="margin-bottom:12px">📝 ${esc(p.obs)}</p>` : ''}
    ${p.aceitaWhats === false ? '<p class="nota" style="margin-bottom:12px">⚠️ Não autorizou lembretes por WhatsApp.</p>' : ''}
    <div class="cartao"><ul class="lista">${hist.map(a => `<li>${htmlLancamento({ tipo: 'atendimento', r: a })}</li>`).join('') || '<li class="vazio">Nenhum atendimento.</li>'}</ul></div>
    <div class="botoes"><button class="btn primario" data-acao="novo-atendimento-de" data-id="${p.id}">＋ Novo atendimento</button></div>`);
};
ACOES['editar-paciente'] = d => formPaciente(E.pacientes.find(x => x.id === d.id));
ACOES['novo-atendimento-de'] = d => formAtendimento({ pacienteId: d.id });

function formPaciente(p) {
  abrirFolha(`${topoFolha(p.id ? 'Editar paciente' : 'Novo paciente')}
    <label class="campo"><span>Nome</span><input id="p-nome" value="${esc(p.nome)}" autocomplete="off" autocapitalize="words" required></label>
    <label class="campo"><span>WhatsApp (com DDD)</span><input id="p-tel" type="tel" inputmode="tel" value="${esc(telefoneBonito(p.telefone))}" placeholder="(27) 99999-9999"></label>
    <label class="interruptor"><span>Autorizou lembretes por WhatsApp</span><input type="checkbox" id="p-aceita" ${p.aceitaWhats === false ? '' : 'checked'}></label>
    <label class="campo"><span>Observação (opcional)</span><textarea id="p-obs" placeholder="Ex.: alérgica a lidocaína; prefere horário da manhã">${esc(p.obs)}</textarea>
      <span class="ajuda">Guarde só o necessário. Prontuário e fotos clínicas ficam fora deste app.</span></label>
    <div class="botoes"><button class="btn primario" id="p-salvar">Salvar</button></div>
    ${p.id ? `<div class="botoes"><button class="btn perigo" id="p-apagar">Apagar dados do paciente</button></div>
      <p class="nota mt">Apagar remove nome, telefone e observação (pedido do paciente, LGPD). Os valores dos atendimentos continuam nas contas.</p>` : ''}`, f => {
    $('#p-salvar', f).onclick = async () => {
      const nome = $('#p-nome', f).value.trim();
      if (!nome) { $('#p-nome', f).focus(); return; }
      const r = await salvarEm('pacientes', { ...p, nome, telefone: $('#p-tel', f).value.replace(/\D/g, ''), aceitaWhats: $('#p-aceita', f).checked, obs: $('#p-obs', f).value.trim() });
      fecharFolha(); render(); aviso('Paciente salvo.');
      if (!p.id) setTimeout(() => ACOES.paciente({ id: r.id }), 50);
    };
    if (p.id) $('#p-apagar', f).onclick = async () => {
      fecharFolha();
      if (!await confirmar(`Apagar os dados de ${p.nome}?`, { sim: 'Apagar', perigo: true })) return;
      await salvarEm('pacientes', { ...p, nome: 'Paciente removido', telefone: '', obs: '', excluido: true });
      for (const a of ativos(E.atendimentos).filter(a => a.pacienteId === p.id && a.retorno && !a.retornoFeito)) await salvarEm('atendimentos', { ...a, retornoFeito: true });
      render(); aviso('Dados do paciente apagados.');
    };
  });
}

/* =====================================================================
   ANEXOS (foto da nota, boleto, comprovante)
   ===================================================================== */
const urls = new Map();
function urlAnexo(a) {
  if (!a.arquivo) return '';
  if (!urls.has(a.id)) urls.set(a.id, URL.createObjectURL(a.arquivo));
  return urls.get(a.id);
}
function widgetAnexos(raiz, existentes, novos) {
  const caixa = $('.anexos', raiz);
  const desenhar = () => {
    caixa.innerHTML = [
      ...existentes.filter(a => !a.remover).map(a => {
        const img = a.tipoArquivo?.startsWith('image/');
        return `<div class="anexo" data-ver="${a.id}">${img ? `<img src="${urlAnexo(a)}" alt="">` : '📄 PDF'}<button type="button" class="tirar" data-tirar="${a.id}" aria-label="Remover">×</button></div>`;
      }),
      ...novos.map((n, i) => `<div class="anexo">${n.type.startsWith('image/') ? `<img src="${n._url ||= URL.createObjectURL(n)}" alt="">` : '📄 PDF'}<button type="button" class="tirar" data-tirar-novo="${i}" aria-label="Remover">×</button></div>`),
      `<label class="anexo anexo-add">${SVG_CLIPE}<span>Anexar</span><input type="file" accept="image/*,application/pdf" multiple hidden></label>`
    ].join('');
    $('input', caixa).onchange = async e => {
      for (const arq of e.target.files) novos.push(await db.comprimirImagem(arq));
      desenhar();
    };
    $$('[data-tirar]', caixa).forEach(b => b.onclick = ev => { ev.stopPropagation(); existentes.find(a => a.id === b.dataset.tirar).remover = true; desenhar(); });
    $$('[data-tirar-novo]', caixa).forEach(b => b.onclick = ev => { ev.stopPropagation(); novos.splice(+b.dataset.tirarNovo, 1); desenhar(); });
    $$('[data-ver]', caixa).forEach(b => b.onclick = () => { const a = existentes.find(x => x.id === b.dataset.ver); window.open(urlAnexo(a), '_blank'); });
  };
  desenhar();
}
async function gravarAnexos(donoId, existentes, novos) {
  for (const a of existentes) if (a.remover) await excluirDe('anexos', a.id);
  for (const arq of novos) await salvarEm('anexos', { donoId, nome: arq.name || 'anexo', tipoArquivo: arq.type || 'image/jpeg', arquivo: arq });
}

/* =====================================================================
   FORMULÁRIO · ATENDIMENTO (receita + retorno)
   ===================================================================== */
function opcoesProcedimentos(sel) {
  return Object.entries(AREAS).map(([area, nome]) => `<optgroup label="${nome}">${procs().filter(p => p.area === area)
    .map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.nome)}</option>`).join('')}</optgroup>`).join('');
}
const valorCampo = v => (v || v === 0) && v !== '' ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';

function formAtendimento(dados = {}, fila = null) {
  const editando = !!dados.id;
  const a = { data: hoje(), status: 'recebido', pagamento: 'pix', ...dados };
  let p = a.pacienteId ? E.pacientes.find(x => x.id === a.pacienteId) : null;
  if (!p && a.paciente) p = ativos(E.pacientes).find(x => semAcento(x.nome) === semAcento(a.paciente)) || null;
  const nomeInicial = p?.nome || a.paciente || '';
  const telInicial = p?.telefone || a.telefone || '';
  if (!a.procedimento) a.procedimento = procs()[0]?.id;
  let retornoManual = editando || !!a.retorno;
  if (!a.retorno && !editando) a.retorno = somaDias(a.data, proc(a.procedimento).retornoDias);
  if (a.taxa === undefined) a.taxa = E.aj.taxas[a.pagamento] ?? 0;
  if ((a.valor === null || a.valor === undefined) && proc(a.procedimento).valor) a.valor = proc(a.procedimento).valor;
  const existentes = editando ? anexosDe(a.id).map(x => ({ ...x })) : [];
  const novos = [...(a.anexosNovos || [])];
  const passo = fila && fila.itens.length > 1 ? `${fila.i + 1} de ${fila.itens.length}` : '';
  const prazos = [[15, '15 dias'], [30, '1 mês'], [90, '3 meses'], [120, '4 meses'], [180, '6 meses'], [365, '1 ano']];

  abrirFolha(`${topoFolha(editando ? 'Editar atendimento' : 'Atendimento', passo || (a.origem ? `"${esc(a.origem)}"` : ''))}
    <label class="campo"><span>Paciente</span><input id="a-nome" list="lista-pac" value="${esc(nomeInicial)}" autocomplete="off" autocapitalize="words" placeholder="Nome do paciente"></label>
    <datalist id="lista-pac">${ativos(E.pacientes).map(x => `<option value="${esc(x.nome)}">`).join('')}</datalist>
    <label class="campo"><span>WhatsApp <small id="a-pac-info" style="font-weight:400"></small></span><input id="a-tel" type="tel" inputmode="tel" value="${esc(telefoneBonito(telInicial))}" placeholder="(27) 99999-9999"></label>
    <div class="dupla">
      <label class="campo"><span>Procedimento</span><select id="a-proc">${opcoesProcedimentos(a.procedimento)}</select></label>
      <label class="campo"><span>Data</span><input id="a-data" type="date" value="${a.data}"></label>
    </div>
    <label class="campo campo-valor"><span>Valor cobrado (R$)</span><input id="a-valor" inputmode="decimal" value="${valorCampo(a.valor)}" placeholder="0,00"></label>
    <div class="campo"><span>Forma de pagamento</span><div class="opcoes" id="a-pag">${PAGAMENTOS.map(x => `<button type="button" class="chip" data-pag="${x.id}" aria-pressed="${a.pagamento === x.id}">${x.nome}</button>`).join('')}</div>
      <div class="dupla mt" id="a-parc-caixa">
        <label class="campo"><span>Taxa da maquininha (%)</span><input id="a-taxa" inputmode="decimal" value="${String(a.taxa).replace('.', ',')}"></label>
        <label class="campo" id="a-parc-campo"><span>Parcelas</span><input id="a-parc" inputmode="numeric" value="${a.parcelas || ''}" placeholder="3"></label>
      </div><span class="ajuda" id="a-taxa-info"></span></div>
    <div class="campo"><span>Já recebeu?</span><div class="segmento" id="a-status"><button type="button" data-st="recebido">Recebido</button><button type="button" data-st="a_receber">A receber</button></div></div>
    <div class="campo"><span>Quando voltar a falar com o paciente</span>
      <input id="a-retorno" type="date" value="${a.retorno || ''}">
      <div class="opcoes mt">${prazos.map(([n, t]) => `<button type="button" class="chip" data-prazo="${n}">${t}</button>`).join('')}<button type="button" class="chip" data-prazo="0">Sem retorno</button></div>
      <span class="ajuda" id="a-retorno-info"></span></div>
    <label class="campo"><span>Observação (opcional)</span><textarea id="a-obs" placeholder="Ex.: 50U de toxina; retoque em 15 dias">${esc(a.obs)}</textarea></label>
    <div class="campo"><span>Comprovante ou recibo</span><div class="anexos"></div></div>
    <div class="botoes">${fila && fila.itens.length > 1 ? '<button class="btn secundario" id="a-pular">Pular</button>' : ''}<button class="btn primario" id="a-salvar">${fila && fila.i < fila.itens.length - 1 ? 'Salvar e próximo' : 'Salvar'}</button></div>
    ${editando ? '<div class="botoes"><button class="btn perigo" id="a-excluir">Excluir atendimento</button></div>' : ''}`, f => {
    const el = id => $('#' + id, f);
    const infoPac = () => {
      const achado = ativos(E.pacientes).find(x => semAcento(x.nome) === semAcento(el('a-nome').value.trim()));
      el('a-pac-info').textContent = achado ? '· paciente já cadastrado' : el('a-nome').value.trim() ? '· paciente novo' : '';
      if (achado && !el('a-tel').value) el('a-tel').value = telefoneBonito(achado.telefone);
    };
    const infoRetorno = () => {
      const pr = proc(el('a-proc').value);
      const v = el('a-retorno').value;
      el('a-retorno-info').textContent = v
        ? `Retorno ${quando(v)} (${dataLonga(v)}). Sugestão para ${pr.nome}: ${textoPrazo(pr.retornoDias)}.`
        : 'Sem retorno marcado.';
    };
    const infoTaxa = () => {
      const pg = f.querySelector('[data-pag][aria-pressed="true"]')?.dataset.pag;
      const parcelado = pg === 'parcelado';
      el('a-parc-campo').style.visibility = parcelado ? 'visible' : 'hidden';
      const taxa = numeroDe(el('a-taxa').value), valor = numeroDe(el('a-valor').value);
      el('a-taxa-info').textContent = taxa > 0 && valor > 0 ? `A maquininha fica com ${brl(valor * taxa / 100)}. Entra líquido ${brl(valor * (1 - taxa / 100))}.` : '';
    };
    const marcarStatus = st => $$('[data-st]', f).forEach(b => b.setAttribute('aria-pressed', b.dataset.st === st));
    marcarStatus(a.status);
    $$('[data-st]', f).forEach(b => b.onclick = () => marcarStatus(b.dataset.st));
    $$('[data-pag]', f).forEach(b => b.onclick = () => {
      $$('[data-pag]', f).forEach(x => x.setAttribute('aria-pressed', x === b));
      el('a-taxa').value = String(E.aj.taxas[b.dataset.pag] ?? 0).replace('.', ',');
      if (b.dataset.pag === 'boleto' && !editando) marcarStatus('a_receber');
      infoTaxa();
    });
    el('a-proc').onchange = () => {
      const pr = proc(el('a-proc').value);
      if (!retornoManual) el('a-retorno').value = somaDias(el('a-data').value || hoje(), pr.retornoDias);
      if (!el('a-valor').value && pr.valor) el('a-valor').value = valorCampo(pr.valor);
      infoRetorno(); infoTaxa();
    };
    el('a-data').onchange = () => { if (!retornoManual) el('a-retorno').value = somaDias(el('a-data').value || hoje(), proc(el('a-proc').value).retornoDias); infoRetorno(); };
    el('a-retorno').onchange = () => { retornoManual = true; infoRetorno(); };
    $$('[data-prazo]', f).forEach(b => b.onclick = () => {
      retornoManual = true;
      el('a-retorno').value = +b.dataset.prazo ? somaDias(el('a-data').value || hoje(), +b.dataset.prazo) : '';
      infoRetorno();
    });
    el('a-nome').oninput = infoPac; el('a-valor').oninput = infoTaxa; el('a-taxa').oninput = infoTaxa;
    infoPac(); infoRetorno(); infoTaxa();
    widgetAnexos(f, existentes, novos);
    if (!nomeInicial) setTimeout(() => el('a-nome').focus(), 300);

    const proximo = () => { fecharFolha(); if (fila && fila.i < fila.itens.length - 1) setTimeout(() => abrirItem(fila, fila.i + 1), 120); else render(); };
    if (el('a-pular')) el('a-pular').onclick = proximo;
    el('a-salvar').onclick = async () => {
      const nome = el('a-nome').value.trim();
      if (!nome) { el('a-nome').focus(); aviso('Coloque o nome do paciente.'); return; }
      const valor = numeroDe(el('a-valor').value);
      /* paciente: acha pelo nome ou cria */
      let pac = ativos(E.pacientes).find(x => semAcento(x.nome) === semAcento(nome));
      const tel = el('a-tel').value.replace(/\D/g, '');
      if (!pac) pac = await salvarEm('pacientes', { nome, telefone: tel, aceitaWhats: true });
      else if (tel && tel !== pac.telefone) pac = await salvarEm('pacientes', { ...pac, telefone: tel });
      const pagamento = f.querySelector('[data-pag][aria-pressed="true"]')?.dataset.pag || null;
      const pr = proc(el('a-proc').value);
      const reg = {
        ...(editando ? E.atendimentos.find(x => x.id === a.id) : {}),
        pacienteId: pac.id, procedimento: pr.id, area: pr.area, data: el('a-data').value || hoje(), valor,
        pagamento, parcelas: pagamento === 'parcelado' ? (parseInt(el('a-parc').value) || null) : null, taxa: numeroDe(el('a-taxa').value),
        status: f.querySelector('[data-st][aria-pressed="true"]').dataset.st, retorno: el('a-retorno').value || null,
        obs: el('a-obs').value.trim()
      };
      if (editando && reg.retorno !== a.retorno) { reg.retornoFeito = false; reg.whatsEm = null; }
      const salvo = await salvarEm('atendimentos', reg);
      /* paciente voltou: os retornos antigos dele saem da lista */
      if (!editando) for (const velho of ativos(E.atendimentos).filter(x => x.pacienteId === pac.id && x.id !== salvo.id && x.retorno && !x.retornoFeito && x.data <= salvo.data)) {
        await salvarEm('atendimentos', { ...velho, retornoFeito: true, retornoFeitoEm: hoje() });
      }
      await gravarAnexos(salvo.id, existentes, novos);
      proximo();
      aviso(`${primeiroNome(nome)} · ${brl(valor)} salvo.`, salvo.retorno ? { rotulo: '📅 Pôr retorno na agenda', acao: () => porNaAgenda(salvo.id) } : {});
    };
    if (editando) el('a-excluir').onclick = async () => {
      fecharFolha();
      if (!await confirmar('Excluir este atendimento?', { sim: 'Excluir', perigo: true })) return;
      await excluirDe('atendimentos', a.id); render(); aviso('Atendimento excluído.');
    };
  });
}
ACOES['editar-atendimento'] = d => { const a = E.atendimentos.find(x => x.id === d.id); if (a) formAtendimento({ ...a }); };

/* =====================================================================
   FORMULÁRIO · DESPESA
   ===================================================================== */
function formDespesa(dados = {}, fila = null) {
  const editando = !!dados.id;
  const d = { data: hoje(), status: 'pago', categoria: 'outros', ...dados };
  const existentes = editando ? anexosDe(d.id).map(x => ({ ...x })) : [];
  const novos = [...(d.anexosNovos || [])];
  const passo = fila && fila.itens.length > 1 ? `${fila.i + 1} de ${fila.itens.length}` : '';
  const grupos = [['variavel', 'Do atendimento'], ['fixa', 'Fixas do mês'], ['outros', 'Outras'], ['retirada', 'Não é custo']];
  abrirFolha(`${topoFolha(editando ? 'Editar despesa' : 'Despesa', passo || (d.origem ? `"${esc(d.origem)}"` : ''))}
    ${d.aviso ? `<div class="faixa alerta"><p>${esc(d.aviso)}</p></div>` : ''}
    <label class="campo campo-valor"><span>Valor (R$)</span><input id="d-valor" inputmode="decimal" value="${valorCampo(d.valor)}" placeholder="0,00"></label>
    <label class="campo"><span>Descrição</span><input id="d-desc" value="${esc(d.descricao)}" placeholder="Ex.: Toxina 100U, Dental Cremer" autocapitalize="sentences"></label>
    <label class="campo"><span>Categoria</span><select id="d-cat">${grupos.map(([g, t]) => `<optgroup label="${t}">${CATEGORIAS.filter(c => c.grupo === g).map(c => `<option value="${c.id}" ${c.id === d.categoria ? 'selected' : ''}>${c.icone} ${esc(c.nome)}</option>`).join('')}</optgroup>`).join('')}</select></label>
    <div class="campo"><span>Já pagou?</span><div class="segmento" id="d-status"><button type="button" data-st="pago">Pago</button><button type="button" data-st="a_pagar">A pagar</button></div></div>
    <div class="dupla">
      <label class="campo"><span>Data da compra</span><input id="d-data" type="date" value="${d.data}"></label>
      <label class="campo" id="d-venc-campo"><span>Vencimento</span><input id="d-venc" type="date" value="${d.vencimento || ''}"></label>
    </div>
    <div class="campo"><span>Nota, cupom ou boleto</span><div class="anexos"></div></div>
    <label class="campo"><span>Observação (opcional)</span><textarea id="d-obs">${esc(d.obs)}</textarea></label>
    <div class="botoes">${fila && fila.itens.length > 1 ? '<button class="btn secundario" id="d-pular">Pular</button>' : ''}<button class="btn primario" id="d-salvar">${fila && fila.i < fila.itens.length - 1 ? 'Salvar e próximo' : 'Salvar'}</button></div>
    ${editando ? '<div class="botoes"><button class="btn perigo" id="d-excluir">Excluir despesa</button></div>' : ''}`, f => {
    const el = id => $('#' + id, f);
    const marcar = st => { $$('[data-st]', f).forEach(b => b.setAttribute('aria-pressed', b.dataset.st === st)); el('d-venc-campo').style.visibility = st === 'a_pagar' ? 'visible' : 'hidden'; };
    marcar(d.status);
    $$('[data-st]', f).forEach(b => b.onclick = () => marcar(b.dataset.st));
    widgetAnexos(f, existentes, novos);
    if (d.valor == null && !editando) setTimeout(() => el('d-valor').focus(), 300);
    const proximo = () => { fecharFolha(); if (fila && fila.i < fila.itens.length - 1) setTimeout(() => abrirItem(fila, fila.i + 1), 120); else render(); };
    if (el('d-pular')) el('d-pular').onclick = proximo;
    el('d-salvar').onclick = async () => {
      const valor = numeroDe(el('d-valor').value);
      if (!(valor > 0)) { el('d-valor').focus(); aviso('Coloque o valor.'); return; }
      const cat = el('d-cat').value;
      const status = f.querySelector('[data-st][aria-pressed="true"]').dataset.st;
      const reg = {
        ...(editando ? E.despesas.find(x => x.id === d.id) : {}),
        ...(d.fixoId ? { fixoId: d.fixoId } : {}),
        valor, descricao: el('d-desc').value.trim() || CATEGORIA[cat].nome, categoria: cat, status,
        data: el('d-data').value || hoje(), vencimento: status === 'a_pagar' ? (el('d-venc').value || null) : (el('d-venc').value || null),
        pagoEm: status === 'pago' ? (d.pagoEm || hoje()) : null, obs: el('d-obs').value.trim()
      };
      const salvo = await salvarEm('despesas', reg);
      await gravarAnexos(salvo.id, existentes, novos);
      proximo();
      aviso(`${reg.descricao} · ${brl(valor)} salvo.`);
    };
    if (editando) el('d-excluir').onclick = async () => {
      fecharFolha();
      if (!await confirmar('Excluir esta despesa?', { sim: 'Excluir', perigo: true })) return;
      await excluirDe('despesas', d.id); render(); aviso('Despesa excluída.');
    };
  });
}
ACOES['editar-despesa'] = d => { const x = E.despesas.find(y => y.id === d.id); if (x) formDespesa({ ...x }); };

/* fila de itens vindos da voz/foto: abre um formulário por vez */
function abrirItem(fila, i) {
  fila.i = i;
  const item = fila.itens[i];
  if (item.tipo === 'atendimento') formAtendimento({ ...item, id: undefined }, fila);
  else formDespesa({ ...item, id: undefined }, fila);
}

/* =====================================================================
   LANÇAR (+): falar, escrever, foto
   ===================================================================== */
const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
let ouvinte = null;

function folhaLancar() {
  abrirFolha(`${topoFolha('O que você quer lançar?')}
    <div class="falar campo">
      <textarea id="l-texto" placeholder="Fale ou escreva do seu jeito…" autocapitalize="sentences"></textarea>
      ${Reconhecimento ? `<button type="button" class="mic" id="l-mic" aria-label="Falar">${SVG_MIC}</button>` : ''}
    </div>
    <p class="exemplos">Exemplos: <i>"atendi a Maria, botox, 1.500 no pix"</i> · <i>"paguei 1.200 de aluguel e 450 de condomínio"</i> · <i>"boleto da Dental Cremer, 890, vence dia 28"</i>${Reconhecimento ? '' : '<br>Dica: toque no 🎤 do teclado para ditar.'}</p>
    <button class="btn primario cheio mt" id="l-entender">Entender e conferir</button>
    <div class="atalhos">
      <label class="atalho largo"><span class="emoji">📷</span><span><strong>Foto da nota ou boleto</strong><br><small>${E.aj.iaLigada ? 'A IA lê o valor, a data e o vencimento' : 'Fica anexada e você digita o valor'}</small></span>
        <input type="file" id="l-foto" accept="image/*,application/pdf" hidden></label>
      <button class="atalho" data-acao="novo-atendimento"><span class="emoji">✨🦷</span><strong>Atendimento</strong><small>Receita do paciente e retorno</small></button>
      <button class="atalho" data-acao="nova-despesa"><span class="emoji">🧾</span><strong>Despesa</strong><small>Material, botox, conta</small></button>
      <button class="atalho largo" data-acao="lancar-fixos" data-mes="${mesDe(hoje())}"><span class="emoji">🏠</span><span><strong>Custos fixos do mês</strong><br><small>Aluguel, condomínio, contas, contador…</small></span></button>
    </div>`, f => {
    const texto = $('#l-texto', f);
    const mic = $('#l-mic', f);
    if (mic) mic.onclick = () => alternarMic(mic, texto);
    $('#l-entender', f).onclick = () => entender(texto.value);
    $('#l-foto', f).onchange = e => { const arq = e.target.files[0]; if (arq) lerFoto(arq, texto.value); };
  });
}
ACOES['novo-atendimento'] = () => formAtendimento({});
ACOES['nova-despesa'] = () => formDespesa({});

function alternarMic(botao, campo) {
  if (ouvinte) { ouvinte.stop(); return; }
  const r = new Reconhecimento();
  r.lang = 'pt-BR'; r.interimResults = true; r.continuous = true;
  const antes = campo.value ? campo.value.trim() + ' ' : '';
  let final = '';
  r.onresult = ev => {
    let parcial = '';
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      if (ev.results[i].isFinal) final += ev.results[i][0].transcript + ' ';
      else parcial += ev.results[i][0].transcript;
    }
    campo.value = (antes + final + parcial).replace(/\s+/g, ' ').trimStart();
  };
  r.onerror = ev => {
    aviso(ev.error === 'not-allowed' || ev.error === 'service-not-allowed'
      ? 'O microfone não foi liberado. Use o 🎤 do teclado para ditar.'
      : ev.error === 'no-speech' ? 'Não ouvi nada. Tente de novo.' : 'O ditado do app falhou. Use o 🎤 do teclado.');
  };
  r.onend = () => { ouvinte = null; botao.classList.remove('ouvindo'); botao.setAttribute('aria-label', 'Falar'); };
  try { r.start(); ouvinte = r; botao.classList.add('ouvindo'); botao.setAttribute('aria-label', 'Parar'); }
  catch { aviso('O ditado do app não está disponível. Use o 🎤 do teclado.'); }
}

function carregando(msg) {
  abrirFolha(`${topoFolha(msg)}<div class="carregando"><div class="giro"></div><span>Só um instante…</span></div>`);
}
async function entender(frase) {
  if (ouvinte) ouvinte.stop();
  frase = frase.trim();
  if (!frase) { aviso('Fale ou escreva o que quer lançar.'); return; }
  let itens = [];
  let avisoIA = '';
  if (E.aj.iaLigada && E.aj.chaveIA && navigator.onLine) {
    carregando('Entendendo…');
    try { itens = await (await import('./ia.js')).entenderTexto(E.aj.chaveIA, frase, procs()); }
    catch (e) { avisoIA = e.message; }
  }
  if (!itens.length) itens = interpretar(frase, { procedimentos: procs() });
  if (folhaAberta) fecharFolha();
  if (avisoIA) aviso(avisoIA + ' Usei a leitura do próprio aparelho.');
  if (!itens.length) {
    setTimeout(() => { folhaLancar(); $('#l-texto').value = frase; aviso('Não achei um valor. Ex.: "paguei 300 de luva".'); }, 150);
    return;
  }
  setTimeout(() => abrirItem({ itens, i: 0 }, 0), 150);
}

async function lerFoto(arquivo, observacao) {
  const foto = await db.comprimirImagem(arquivo);
  if (!E.aj.iaLigada || !E.aj.chaveIA) {
    fecharFolha();
    setTimeout(() => formDespesa({ anexosNovos: [foto], aviso: 'Foto anexada. Digite o valor. (Para a IA ler sozinha, ligue em Ajustes.)' }), 150);
    return;
  }
  if (!navigator.onLine) {
    fecharFolha();
    setTimeout(() => formDespesa({ anexosNovos: [foto], aviso: 'Sem internet: a foto ficou anexada, digite o valor.' }), 150);
    return;
  }
  carregando('Lendo a nota…');
  let itens = [], erro = '';
  try {
    const ia = await import('./ia.js');
    itens = await ia.entenderImagem(E.aj.chaveIA, await db.blobParaBase64(foto), foto.type, procs(), observacao.trim());
  } catch (e) { erro = e.message; }
  fecharFolha();
  if (!itens.length) {
    setTimeout(() => formDespesa({ anexosNovos: [foto], aviso: erro || 'Não consegui ler valores na foto. Ela ficou anexada; digite o valor.' }), 150);
    return;
  }
  itens[0].anexosNovos = [foto];
  setTimeout(() => abrirItem({ itens, i: 0 }, 0), 150);
}

/* custos fixos do mês: marca, ajusta o valor e lança */
ACOES['lancar-fixos'] = d => {
  const ym = d.mes || mesDe(hoje());
  const pend = fixosPendentes(ym);
  if (!ativos(E.fixos).length) { location.hash = 'ajustes'; aviso('Cadastre seus custos fixos primeiro.'); return; }
  abrirFolha(`${topoFolha('Custos fixos', nomeMes(ym))}
    ${pend.length ? `<p class="nota" style="margin-bottom:10px">Confira os valores deste mês e toque em lançar. Entram como "a pagar", com o vencimento no dia de cada um.</p>
    <div class="cartao">${pend.map(x => `<div class="item">
      <input type="checkbox" data-fixo="${x.id}" ${x.valor > 0 ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--escuro)" aria-label="${esc(x.descricao)}">
      <div class="item-meio"><div class="item-titulo">${CATEGORIA[x.categoria]?.icone || ''} ${esc(x.descricao)}</div><div class="item-sub">vence dia ${x.dia}</div></div>
      <input data-valor="${x.id}" inputmode="decimal" value="${valorCampo(x.valor)}" placeholder="0,00" style="width:110px;height:42px;border:1px solid var(--linha-forte);border-radius:10px;padding:0 10px;text-align:right;font-weight:600">
    </div>`).join('')}</div>
    <div class="botoes"><button class="btn primario" id="f-lancar">Lançar selecionados</button></div>`
    : '<div class="cartao vazio"><strong>Tudo lançado ✓</strong>Os custos fixos deste mês já estão nos lançamentos.</div>'}
    <p class="nota centro mt"><a href="#ajustes" data-acao="fechar">Editar a lista de custos fixos</a></p>`, f => {
    $$('[data-valor]', f).forEach(i => i.oninput = () => { $(`[data-fixo="${i.dataset.valor}"]`, f).checked = numeroDe(i.value) > 0; });
    const b = $('#f-lancar', f);
    if (b) b.onclick = async () => {
      let n = 0;
      for (const x of pend) {
        if (!$(`[data-fixo="${x.id}"]`, f).checked) continue;
        const valor = numeroDe($(`[data-valor="${x.id}"]`, f).value);
        if (!(valor > 0)) continue;
        const [a, m] = ym.split('-').map(Number);
        const ultimo = new Date(a, m, 0).getDate();
        const dia = `${ym}-${String(Math.min(x.dia || 10, ultimo)).padStart(2, '0')}`;
        await salvarEm('despesas', { fixoId: x.id, descricao: x.descricao, categoria: x.categoria, valor, data: dia, vencimento: dia, status: 'a_pagar' });
        if (valor !== x.valor) await salvarEm('fixos', { ...x, valor }); // guarda o último valor para o mês que vem
        n++;
      }
      fecharFolha(); UI.mesLanc = ym; if (location.hash !== '#lancamentos') location.hash = 'lancamentos'; else render();
      aviso(n ? `${n} custo${n > 1 ? 's' : ''} fixo${n > 1 ? 's' : ''} lançado${n > 1 ? 's' : ''}.` : 'Nada lançado: coloque os valores.');
    };
  });
};

/* =====================================================================
   RESUMO
   ===================================================================== */
function telaResumo() {
  const ym = UI.mesResumo;
  const c = contasDoMes(ym, E.atendimentos, E.despesas);
  const ant = contasDoMes(somaMesYM(ym, -1), E.atendimentos, E.despesas);
  const variacao = (agora, antes) => antes > 0 ? `<span class="pilula ${agora >= antes ? 'bom' : 'neutra'}">${agora >= antes ? '▲' : '▼'} ${pct(Math.abs(agora / antes - 1))} vs. mês anterior</span>` : '';
  const meses = Array.from({ length: 6 }, (_, i) => somaMesYM(ym, i - 5)).map(m => ({ m, ...contasDoMes(m, E.atendimentos, E.despesas) }));
  const cats = Object.entries(c.porCategoria).sort((a, b) => b[1] - a[1]);
  const maxCat = cats[0]?.[1] || 1;
  const procsMes = Object.entries(c.porProc).sort((a, b) => b[1].valor - a[1].valor);
  const maxProc = procsMes[0]?.[1].valor || 1;
  const totalArea = (c.porArea.estetica || 0) + (c.porArea.odonto || 0);
  const ehMesAtual = ym === mesDe(hoje());
  let equilibrio = '';
  if (c.equilibrio !== null && c.fixas > 0) {
    const falta = c.equilibrio - c.qtd;
    equilibrio = falta > 0
      ? `<div class="valor">${falta} ${falta === 1 ? 'atendimento' : 'atendimentos'}</div><p>${ehMesAtual ? 'faltam' : 'faltaram'} para pagar os custos fixos (${c.equilibrio} no total, com o ticket do mês)</p>`
      : `<div class="valor positivo">Pago ✓</div><p>Os custos fixos já se pagaram com ${c.equilibrio} ${c.equilibrio === 1 ? 'atendimento' : 'atendimentos'}. O resto vira lucro.</p>`;
  } else if (c.fixas > 0) equilibrio = c.qtd
    ? `<div class="valor negativo">Não fecha</div><p>Os gastos com material e taxas passaram da receita do mês. Nenhum número de atendimentos paga os ${brlCurto(c.fixas)} de custos fixos assim.</p>`
    : `<div class="valor">—</div><p>Lance os atendimentos para ver quantos pagam os ${brlCurto(c.fixas)} de custos fixos.</p>`;
  return `
    ${navMes('mesResumo')}
    ${placar(c)}
    <div class="cartao pad mt">
      <table class="conta">
        <tr><td><i class="ponto receita"></i> Receita dos atendimentos</td><td>${brl(c.receita)}</td></tr>
        <tr><td class="menos">− Taxas da maquininha</td><td class="menos">${brl(c.taxas)}</td></tr>
        <tr><td class="menos"><i class="ponto despesa"></i> − Despesas</td><td class="menos">${brl(c.despesa)}</td></tr>
        <tr class="total"><td>Lucro líquido</td><td class="${c.lucro >= 0 ? 'positivo' : 'negativo'}">${brl(c.lucro)}</td></tr>
        <tr><td>Margem</td><td>${pct(c.margem)}</td></tr>
        ${c.retiradas ? `<tr><td class="menos">Retiradas pessoais (fora da conta)</td><td class="menos">${brl(c.retiradas)}</td></tr>` : ''}
      </table>
      <p class="nota mt">${variacao(c.lucro, ant.lucro) || 'Margem = quanto sobra de cada R$ 100 que entram.'}</p>
    </div>

    <div class="indicadores mt">
      <div class="indicador"><div class="rotulo">Atendimentos</div><div class="valor">${c.qtd}</div><p>ticket médio ${brl(c.ticket)}</p></div>
      <div class="indicador"><div class="rotulo">Ponto de equilíbrio</div>${equilibrio || '<div class="valor">—</div><p>Lance os custos fixos para calcular.</p>'}</div>
      <div class="indicador"><div class="rotulo">A receber</div><div class="valor">${brlCurto(c.aReceber)}</div><p>atendimentos do mês ainda não pagos</p></div>
      <div class="indicador"><div class="rotulo">A pagar</div><div class="valor">${brlCurto(c.aPagar)}</div><p>contas do mês em aberto</p></div>
    </div>

    <div class="secao"><h2>Últimos 6 meses</h2></div>
    <div class="cartao pad">${grafico(meses)}</div>

    ${totalArea ? `<div class="secao"><h2>Receita por área</h2></div>
    <div class="cartao pad"><ul class="barras">${['estetica', 'odonto'].map(ar => `<li><div class="cab"><span>${ICONE_AREA[ar]} ${AREAS[ar]} · ${pct((c.porArea[ar] || 0) / totalArea)}</span><span>${brl(c.porArea[ar] || 0)}</span></div>
      <div class="trilho"><div class="enchimento" style="width:${(c.porArea[ar] || 0) / totalArea * 100}%;background:var(--receita)"></div></div></li>`).join('')}</ul></div>` : ''}

    ${procsMes.length ? `<div class="secao"><h2>Procedimentos</h2></div>
    <div class="cartao pad"><ul class="barras">${procsMes.map(([id, v]) => `<li><div class="cab"><span>${esc(proc(id).nome)} · ${v.qtd}×</span><span>${brl(v.valor)}</span></div>
      <div class="trilho"><div class="enchimento" style="width:${v.valor / maxProc * 100}%;background:var(--receita)"></div></div></li>`).join('')}</ul></div>` : ''}

    ${cats.length ? `<div class="secao"><h2>Para onde foi o dinheiro</h2></div>
    <div class="cartao pad"><ul class="barras">${cats.map(([id, v]) => `<li><div class="cab"><span>${CATEGORIA[id]?.icone || ''} ${esc(CATEGORIA[id]?.nome || id)}</span><span>${brl(v)} · ${pct(v / c.despesa)}</span></div>
      <div class="trilho"><div class="enchimento" style="width:${v / maxCat * 100}%;background:var(--despesa)"></div></div></li>`).join('')}</ul>
      <p class="nota mt">Fixas: ${brl(c.fixas)} · Do atendimento e outras: ${brl(c.variaveis)}</p></div>` : ''}
    <p class="nota centro mt"><button class="btn pequeno secundario" data-acao="csv" data-mes="${ym}">Baixar planilha do mês</button></p>
  `;
}

/* gráfico de barras: receita × despesa por mês (um eixo só, com dica ao tocar) */
function grafico(meses) {
  const W = 340, H = 180, topo = 10, base = 150, esq = 44;
  const max = Math.max(1, ...meses.map(m => Math.max(m.receita, m.despesa + m.taxas)));
  const passo = niceStep(max / 3);
  const teto = Math.ceil(max / passo) * passo;
  const y = v => base - (v / teto) * (base - topo);
  const larg = (W - esq) / meses.length;
  const barra = Math.min(16, larg / 2 - 5);
  const linhas = [];
  for (let v = 0; v <= teto + 0.01; v += passo) linhas.push(`<line class="grade" x1="${esq}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text class="eixo" x="${esq - 6}" y="${y(v) + 4}" text-anchor="end">${v >= 1000 ? (v / 1000).toLocaleString('pt-BR') + 'k' : v}</text>`);
  const rr = (x, top, w) => { const h = Math.max(0, base - top); if (h < 1) return ''; const r = Math.min(4, h, w / 2); return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${base}Z`; };
  const barras = meses.map((m, i) => {
    const cx = esq + larg * i + larg / 2;
    const desp = m.despesa + m.taxas;
    return `<g class="mes-grupo" data-i="${i}">
      <rect x="${cx - larg / 2}" y="${topo}" width="${larg}" height="${base - topo + 24}" fill="transparent"/>
      <path d="${rr(cx - barra - 1, y(m.receita), barra)}" fill="var(--receita)"/>
      <path d="${rr(cx + 1, y(desp), barra)}" fill="var(--despesa)"/>
      <text class="eixo" x="${cx}" y="${base + 16}" text-anchor="middle">${nomeMesCurto(m.m)}</text></g>`;
  }).join('');
  const dados = JSON.stringify(meses.map(m => ({ m: nomeMes(m.m), r: brl(m.receita), d: brl(m.despesa + m.taxas), l: brl(m.lucro) })));
  return `<div class="legenda"><span><i class="ponto receita"></i>Receita</span><span><i class="ponto despesa"></i>Despesas e taxas</span></div>
    <div class="grafico" data-meses='${esc(dados)}'><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Receita e despesas dos últimos 6 meses">${linhas.join('')}${barras}</svg><div class="dica" hidden></div></div>
    <details class="mt"><summary class="nota">Ver em tabela</summary>
      <table class="conta mt"><tr><td><b>Mês</b></td><td><b>Receita</b></td><td><b>Despesas</b></td><td><b>Lucro</b></td></tr>
      ${meses.map(m => `<tr><td style="text-transform:capitalize">${nomeMesCurto(m.m)}</td><td>${brlCurto(m.receita)}</td><td>${brlCurto(m.despesa + m.taxas)}</td><td>${brlCurto(m.lucro)}</td></tr>`).join('')}</table></details>`;
}
function niceStep(v) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1))));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}
function montarGrafico() {
  const g = $('.grafico', tela);
  if (!g) return;
  const dados = JSON.parse(g.dataset.meses);
  const dica = $('.dica', g);
  const mostrar = grupo => {
    const d = dados[+grupo.dataset.i];
    const caixa = grupo.getBoundingClientRect(), pai = g.getBoundingClientRect();
    dica.innerHTML = `<b>${d.m}</b><br>Receita ${d.r}<br>Despesas ${d.d}<br>Lucro ${d.l}`;
    dica.hidden = false;
    const x = Math.min(Math.max(caixa.left - pai.left + caixa.width / 2, 70), pai.width - 70);
    dica.style.left = x + 'px'; dica.style.top = '10px';
  };
  $$('.mes-grupo', g).forEach(gr => { gr.addEventListener('pointerenter', () => mostrar(gr)); gr.addEventListener('click', () => mostrar(gr)); });
  g.addEventListener('pointerleave', () => { dica.hidden = true; });
}

/* =====================================================================
   AJUSTES
   ===================================================================== */
function telaAjustes() {
  const ult = E.aj.ultimoBackup;
  return `
    <h1 class="titulo">Ajustes</h1>

    <div class="secao"><h2>Backup</h2></div>
    <div class="cartao pad">
      <p>${ult ? `Último backup: <strong>${dataLonga(ult.slice(0, 10))}</strong> (${quando(ult.slice(0, 10))}).` : '<strong>Nenhum backup ainda.</strong>'}</p>
      <p class="nota mt">Os dados ficam só neste celular. O backup gera um arquivo protegido por senha para guardar no Google Drive ou no iCloud. Para levar tudo para um celular novo, é só restaurar lá.</p>
      <div class="botoes"><button class="btn primario" data-acao="backup">Fazer backup</button><label class="btn secundario">Restaurar<input type="file" id="aj-restaurar" accept=".clinica,application/octet-stream,application/json" hidden></label></div>
      ${E.aj.senhaBackup ? '<p class="nota centro mt"><button class="btn pequeno secundario" data-acao="ver-senha">Ver ou trocar a senha do backup</button></p>' : ''}
    </div>

    <div class="secao"><h2>Custos fixos</h2><button class="link" data-acao="editar-fixo">＋ Adicionar</button></div>
    <div class="cartao"><ul class="lista">${ativos(E.fixos).map(x => `<li><button class="item" data-acao="editar-fixo" data-id="${x.id}">
      <div class="item-icone despesa">${CATEGORIA[x.categoria]?.icone || '📦'}</div>
      <div class="item-meio"><div class="item-titulo">${esc(x.descricao)}</div><div class="item-sub">vence dia ${x.dia}</div></div>
      <div class="item-fim"><span class="item-valor">${x.valor ? brl(x.valor) : '<span class="nota">sem valor</span>'}</span></div></button></li>`).join('') || '<li class="vazio">Nenhum custo fixo.</li>'}</ul></div>

    <div class="secao"><h2>Procedimentos e retornos</h2><button class="link" data-acao="editar-proc">＋ Adicionar</button></div>
    <div class="cartao"><ul class="lista">${E.aj.procedimentos.filter(p => !p.oculto).map(p => `<li><button class="item" data-acao="editar-proc" data-id="${p.id}">
      <div class="item-icone">${ICONE_AREA[p.area]}</div>
      <div class="item-meio"><div class="item-titulo">${esc(p.nome)}</div><div class="item-sub">retorno em ${textoPrazo(p.retornoDias)}${p.valor ? ' · ' + brl(p.valor) : ''}</div></div></button></li>`).join('')}</ul></div>

    <div class="secao"><h2>Taxas da maquininha</h2></div>
    <div class="cartao pad"><div class="dupla">${PAGAMENTOS.map(p => `<label class="campo"><span>${p.nome} (%)</span><input inputmode="decimal" data-taxa="${p.id}" value="${String(E.aj.taxas[p.id] ?? 0).replace('.', ',')}"></label>`).join('')}</div>
      <p class="nota">Descontadas da receita no cálculo do lucro. Confira no app da sua maquininha.</p></div>

    <div class="secao"><h2>Mensagem de retorno</h2></div>
    <div class="cartao pad">
      <label class="campo"><textarea id="aj-msg" rows="4">${esc(E.aj.mensagem)}</textarea><span class="ajuda">{nome} vira o primeiro nome do paciente. Evite citar o procedimento: a prévia da mensagem aparece na tela bloqueada do celular.</span></label>
      <button class="btn pequeno secundario" data-acao="msg-padrao">Voltar ao texto original</button>
    </div>

    <div class="secao"><h2>Leitura com IA (opcional)</h2></div>
    <div class="cartao pad">
      <label class="interruptor"><span>Ler fotos e frases com IA</span><input type="checkbox" id="aj-ia" ${E.aj.iaLigada ? 'checked' : ''}></label>
      <p class="nota">Sem a IA, o app já entende frases simples e guarda as fotos. Com a IA, ele também lê o valor, a data e o vencimento das fotos de nota e boleto.</p>
      <p class="nota mt"><strong>Privacidade:</strong> ao ligar, o texto e as fotos que você mandar para leitura vão para a Anthropic (empresa do Claude, nos EUA), só para extrair os valores. Prefira fotografar notas de fornecedor e evite nomes completos de pacientes.</p>
      <label class="campo mt"><span>Chave da API (fica só neste celular)</span><input id="aj-chave" type="password" autocomplete="off" value="${esc(E.aj.chaveIA)}" placeholder="sk-ant-…"></label>
      <button class="btn pequeno secundario" data-acao="testar-ia">Testar</button>
    </div>

    <div class="secao"><h2>Privacidade</h2></div>
    <div class="cartao pad">
      <label class="interruptor"><span>Pedir PIN ao abrir</span><input type="checkbox" id="aj-pin" ${E.aj.pinHash ? 'checked' : ''}></label>
      <p class="nota">O PIN esconde a tela de quem pegar o celular. Não é criptografia: a proteção de verdade é o bloqueio do próprio celular.</p>
    </div>

    <div class="secao"><h2>Sobre</h2></div>
    <div class="cartao pad"><p class="nota">Clínica · versão 1 (MVP). Os dados ficam só neste aparelho, guardados pelo navegador.
      ${instalado() ? 'App instalado na tela inicial ✓' : ehIOS() ? 'Instale: Safari → Compartilhar → Adicionar à Tela de Início.' : 'Instale pelo menu do navegador → Instalar app.'}</p></div>
  `;
}
function montarAjustes() {
  $$('[data-taxa]', tela).forEach(i => i.onchange = async () => { await ajustar('taxas', { ...E.aj.taxas, [i.dataset.taxa]: numeroDe(i.value) }); aviso('Taxa salva.'); });
  $('#aj-msg', tela).onchange = async e => { await ajustar('mensagem', e.target.value.trim() || MENSAGEM_PADRAO); aviso('Mensagem salva.'); };
  $('#aj-ia', tela).onchange = async e => {
    if (e.target.checked && !$('#aj-chave', tela).value.trim()) { aviso('Cole a chave da API para ligar.'); }
    await ajustar('iaLigada', e.target.checked);
  };
  $('#aj-chave', tela).onchange = async e => { await ajustar('chaveIA', e.target.value.trim()); aviso('Chave salva neste celular.'); };
  $('#aj-pin', tela).onchange = e => { if (e.target.checked) criarPin(); else { ajustar('pinHash', null); aviso('PIN desligado.'); } };
  $('#aj-restaurar', tela).onchange = e => { const arq = e.target.files[0]; if (arq) restaurar(arq); e.target.value = ''; };
}
ACOES['msg-padrao'] = async () => { await ajustar('mensagem', MENSAGEM_PADRAO); render(); aviso('Texto original de volta.'); };
ACOES['testar-ia'] = async () => {
  const chave = $('#aj-chave').value.trim();
  if (!chave) { aviso('Cole a chave primeiro.'); return; }
  await ajustar('chaveIA', chave);
  aviso('Testando…', { tempo: 20000 });
  try {
    const itens = await (await import('./ia.js')).entenderTexto(chave, 'paguei 10 reais de luva', procs());
    aviso(itens[0]?.valor === 10 ? 'Funcionou ✓ A IA está pronta.' : 'A IA respondeu, mas não como esperado.');
    if (!E.aj.iaLigada) { await ajustar('iaLigada', true); render(); }
  } catch (e) { aviso(e.message); }
};

ACOES['editar-fixo'] = d => {
  const x = d.id ? E.fixos.find(y => y.id === d.id) : { descricao: '', categoria: 'aluguel', valor: 0, dia: 10 };
  abrirFolha(`${topoFolha(d.id ? 'Custo fixo' : 'Novo custo fixo')}
    <label class="campo"><span>Nome</span><input id="x-desc" value="${esc(x.descricao)}" placeholder="Ex.: Aluguel"></label>
    <label class="campo"><span>Categoria</span><select id="x-cat">${CATEGORIAS.filter(c => c.grupo !== 'retirada').map(c => `<option value="${c.id}" ${c.id === x.categoria ? 'selected' : ''}>${c.icone} ${esc(c.nome)}</option>`).join('')}</select></label>
    <div class="dupla"><label class="campo campo-valor"><span>Valor de sempre (R$)</span><input id="x-valor" inputmode="decimal" value="${valorCampo(x.valor || '')}" placeholder="0,00"></label>
    <label class="campo"><span>Vence todo dia</span><input id="x-dia" inputmode="numeric" value="${x.dia}"></label></div>
    <div class="botoes"><button class="btn primario" id="x-salvar">Salvar</button></div>
    ${d.id ? '<div class="botoes"><button class="btn perigo" id="x-excluir">Remover da lista</button></div>' : ''}`, f => {
    $('#x-salvar', f).onclick = async () => {
      const descricao = $('#x-desc', f).value.trim();
      if (!descricao) { $('#x-desc', f).focus(); return; }
      await salvarEm('fixos', { ...x, descricao, categoria: $('#x-cat', f).value, valor: numeroDe($('#x-valor', f).value), dia: Math.min(31, Math.max(1, parseInt($('#x-dia', f).value) || 10)) });
      fecharFolha(); render(); aviso('Custo fixo salvo.');
    };
    if (d.id) $('#x-excluir', f).onclick = async () => { await excluirDe('fixos', x.id); fecharFolha(); render(); };
  });
};
ACOES['editar-proc'] = d => {
  const p = d.id ? E.aj.procedimentos.find(y => y.id === d.id) : { id: 'p-' + db.novoId().slice(0, 8), nome: '', area: 'estetica', retornoDias: 90, valor: 0, chaves: [] };
  const prazos = [[7, '7 dias'], [15, '15 dias'], [30, '1 mês'], [45, '45 dias'], [90, '3 meses'], [120, '4 meses'], [180, '6 meses'], [270, '9 meses'], [365, '1 ano']];
  abrirFolha(`${topoFolha(d.id ? 'Procedimento' : 'Novo procedimento')}
    <label class="campo"><span>Nome</span><input id="r-nome" value="${esc(p.nome)}"></label>
    <div class="campo"><span>Área</span><div class="segmento"><button type="button" data-area="estetica">✨ Estética</button><button type="button" data-area="odonto">🦷 Odontologia</button></div></div>
    <label class="campo"><span>Retorno em quantos dias</span><input id="r-dias" inputmode="numeric" value="${p.retornoDias}">
      <div class="opcoes mt">${prazos.map(([n, t]) => `<button type="button" class="chip" data-dias="${n}">${t}</button>`).join('')}</div></label>
    <label class="campo campo-valor"><span>Preço de costume (opcional, R$)</span><input id="r-valor" inputmode="decimal" value="${valorCampo(p.valor || '')}" placeholder="0,00"><span class="ajuda">Já vem preenchido quando você lança este procedimento.</span></label>
    <div class="botoes"><button class="btn primario" id="r-salvar">Salvar</button></div>
    ${d.id ? '<div class="botoes"><button class="btn perigo" id="r-ocultar">Tirar da lista</button></div>' : ''}`, f => {
    let area = p.area;
    const marcar = () => $$('[data-area]', f).forEach(b => b.setAttribute('aria-pressed', b.dataset.area === area));
    marcar();
    $$('[data-area]', f).forEach(b => b.onclick = () => { area = b.dataset.area; marcar(); });
    $$('[data-dias]', f).forEach(b => b.onclick = () => { $('#r-dias', f).value = b.dataset.dias; });
    const gravar = async mudanca => {
      const lista = E.aj.procedimentos.some(y => y.id === p.id) ? E.aj.procedimentos.map(y => y.id === p.id ? { ...y, ...mudanca } : y) : [...E.aj.procedimentos, { ...p, ...mudanca }];
      await ajustar('procedimentos', lista); fecharFolha(); render();
    };
    $('#r-salvar', f).onclick = () => {
      const nome = $('#r-nome', f).value.trim();
      if (!nome) { $('#r-nome', f).focus(); return; }
      gravar({ nome, area, retornoDias: Math.max(1, parseInt($('#r-dias', f).value) || 90), valor: numeroDe($('#r-valor', f).value) });
    };
    if (d.id) $('#r-ocultar', f).onclick = () => gravar({ oculto: true });
  });
};

/* ---------- backup ---------- */
function pedirSenhaNova() {
  return new Promise(ok => {
    abrirFolha(`${topoFolha('Senha do backup')}
      <p class="nota" style="margin-bottom:12px">O arquivo de backup fica trancado com esta senha. <strong>Anote num lugar seguro:</strong> sem ela, o backup não abre em outro celular.</p>
      <label class="campo"><span>Senha (mínimo 6 caracteres)</span><input id="s-1" type="text" autocomplete="off" autocapitalize="off"></label>
      <label class="campo"><span>Repita a senha</span><input id="s-2" type="text" autocomplete="off" autocapitalize="off"></label>
      <div class="botoes"><button class="btn primario" id="s-ok">Guardar senha</button></div>`, f => {
      setTimeout(() => $('#s-1', f).focus(), 300);
      $('#s-ok', f).onclick = async () => {
        const a = $('#s-1', f).value, b = $('#s-2', f).value;
        if (a.length < 6) { aviso('Use pelo menos 6 caracteres.'); return; }
        if (a !== b) { aviso('As duas senhas estão diferentes.'); return; }
        await ajustar('senhaBackup', a); fecharFolha(); ok(a);
      };
    });
  });
}
ACOES['ver-senha'] = () => {
  abrirFolha(`${topoFolha('Senha do backup')}<p class="cartao pad" style="font-size:20px;font-weight:600;letter-spacing:.05em;user-select:all">${esc(E.aj.senhaBackup)}</p>
    <p class="nota mt">Trocar a senha vale para os próximos backups. Os antigos continuam abrindo com a senha antiga.</p>
    <div class="botoes"><button class="btn secundario" id="s-trocar">Trocar senha</button></div>`, f => { $('#s-trocar', f).onclick = () => pedirSenhaNova(); });
};
ACOES.backup = async () => {
  const senha = E.aj.senhaBackup || await pedirSenhaNova();
  if (!senha) return;
  carregando('Preparando o backup…');
  try {
    const blob = await db.gerarBackup(senha);
    const nome = `clinica-backup-${hoje()}.clinica`;
    const arquivo = new File([blob], nome, { type: 'application/octet-stream' });
    fecharFolha();
    let ok = false;
    if (navigator.canShare?.({ files: [arquivo] })) {
      try { await navigator.share({ files: [arquivo], title: 'Backup da Clínica' }); ok = true; }
      catch (e) { if (e.name === 'AbortError') { aviso('Backup cancelado.'); return; } }
    }
    if (!ok) { baixar(blob, nome); ok = true; }
    await ajustar('ultimoBackup', new Date().toISOString());
    render(); aviso('Backup feito ✓ Guarde o arquivo no Drive ou no iCloud.');
  } catch (e) { fecharFolha(); aviso('Não deu para fazer o backup: ' + e.message); }
};
async function restaurar(arquivo) {
  const senha = await new Promise(ok => abrirFolha(`${topoFolha('Restaurar backup')}
    <p class="nota" style="margin-bottom:12px">Os dados do arquivo são juntados aos deste celular. Nada é apagado: fica sempre a versão mais nova de cada registro.</p>
    <label class="campo"><span>Senha do backup</span><input id="r-senha" type="text" autocomplete="off" autocapitalize="off" value="${esc(E.aj.senhaBackup)}"></label>
    <div class="botoes"><button class="btn primario" id="r-ok">Restaurar</button></div>`, f => { $('#r-ok', f).onclick = () => { const s = $('#r-senha', f).value; fecharFolha(); ok(s); }; }));
  if (!senha) return;
  carregando('Restaurando…');
  try {
    const dados = await db.lerBackup(arquivo, senha);
    const n = await db.restaurarBackup(dados);
    if (!E.aj.senhaBackup) await db.gravarAjuste('senhaBackup', senha);
    await carregar(); fecharFolha(); render(); aviso(`Backup restaurado ✓ (${n} registros).`);
  } catch (e) { fecharFolha(); aviso(e.message); }
}

/* ---------- PIN (tela de privacidade) ---------- */
const hashPin = pin => db.hashTexto('clinica-rebeca:' + pin);
function teclado(ao) {
  const t = $('#trava-teclado');
  t.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => `<button type="button" class="${k === '' ? 'vazio' : k === '⌫' ? 'apagar' : ''}" data-k="${k}">${k === '⌫' ? 'apagar' : k}</button>`).join('');
  let digitado = '';
  const pontos = () => $$('#trava-pontos i').forEach((i, n) => i.classList.toggle('cheio', n < digitado.length));
  t.onclick = async e => {
    const k = e.target.closest('[data-k]')?.dataset.k;
    if (k === undefined || k === '') return;
    if (k === '⌫') digitado = digitado.slice(0, -1); else if (digitado.length < 4) digitado += k;
    pontos();
    if (digitado.length === 4) { const d = digitado; digitado = ''; setTimeout(pontos, 150); await ao(d); }
  };
  pontos();
}
function errarPin() { const p = $('#trava-pontos'); p.classList.remove('erro'); void p.offsetWidth; p.classList.add('erro'); }
function travar() {
  if (!E.aj.pinHash) return;
  $('#trava').hidden = false; $('#trava-texto').textContent = 'Digite o PIN';
  teclado(async pin => { if (await hashPin(pin) === E.aj.pinHash) $('#trava').hidden = true; else errarPin(); });
}
function criarPin() {
  let primeiro = null;
  $('#trava').hidden = false; $('#trava-texto').textContent = 'Escolha um PIN de 4 números';
  teclado(async pin => {
    if (!primeiro) { primeiro = pin; $('#trava-texto').textContent = 'Repita o PIN'; return; }
    if (pin !== primeiro) { primeiro = null; errarPin(); $('#trava-texto').textContent = 'Não bateu. Escolha de novo'; return; }
    await ajustar('pinHash', await hashPin(pin));
    $('#trava').hidden = true; aviso('PIN ligado.');
  });
}
let escondidoEm = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) escondidoEm = Date.now();
  else {
    if (E.aj.pinHash && Date.now() - escondidoEm > 2 * 60_000) travar();
    if (location.hash === '' || location.hash === '#inicio') render(); // o dia pode ter virado
  }
});

/* ---------- montar cada tela depois de desenhar ---------- */
function montarTela(aba) {
  $('#topo-sub').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  if (aba === 'pacientes') {
    const b = $('#busca-pac');
    b.oninput = () => { UI.buscaPac = b.value; const pos = b.selectionStart; render(); const nb = $('#busca-pac'); nb.focus(); nb.setSelectionRange(pos, pos); };
  }
  if (aba === 'resumo') montarGrafico();
  if (aba === 'ajustes') montarAjustes();
}

/* ---------- começo ---------- */
async function iniciar() {
  try {
    await carregar();
  } catch (e) {
    tela.innerHTML = `<div class="cartao pad"><p><strong>Não consegui abrir o banco de dados deste aparelho.</strong></p><p class="nota mt">${esc(e.message)}. Se estiver numa aba anônima, abra numa aba normal.</p></div>`;
    return;
  }
  if (!E.aj.fixosIniciados) {
    for (const x of FIXOS_PADRAO) await salvarEm('fixos', { ...x });
    await ajustar('fixosIniciados', true);
  }
  /* prévia: preenche com dados de exemplo na primeira vez */
  if (window.CLINICA_DEMO && !E.atendimentos.length && !E.despesas.length) {
    try { await (await import('./demo.js')).semearExemplo(); await carregar(); } catch (e) { console.warn('exemplo', e); }
  }
  db.pedirPersistencia();
  travar();
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}
iniciar();
