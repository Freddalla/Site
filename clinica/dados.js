/* =====================================================================
   CLÍNICA · dados fixos e utilidades (sem nada de navegador aqui,
   para poder ser testado no Node também)
   ===================================================================== */

/* ---------- Categorias de despesa ----------
   grupo: 'variavel' (ligado ao atendimento), 'fixa' (todo mês),
          'outros' (marketing, impostos, investimentos), 'retirada' (não é custo) */
export const CATEGORIAS = [
  { id: 'toxina',       nome: 'Toxina botulínica',            grupo: 'variavel', icone: '💉',
    chaves: ['botox', 'toxina', 'botulinica', 'dysport', 'xeomin', 'botulift', 'nabota', 'prosigne'] },
  { id: 'preenchedor',  nome: 'Ácido hialurônico e bioestimulador', grupo: 'variavel', icone: '💧',
    chaves: ['acido hialuronico', 'hialuronico', 'preenchedor', 'bioestimulador', 'sculptra', 'radiesse', 'skinbooster', 'fio de pdo', 'fios de pdo', 'canula', 'hialuronidase', 'enzima'] },
  { id: 'material',     nome: 'Materiais odontológicos',      grupo: 'variavel', icone: '🦷',
    chaves: ['material', 'materiais', 'resina', 'anestesico', 'anestesia', 'broca', 'ionomero', 'adesivo', 'fio de sutura', 'sutura', 'amalgama', 'flúor', 'fluor', 'pasta profilatica', 'clareador', 'agulha', 'carpule'] },
  { id: 'descartaveis', nome: 'Descartáveis, EPI e esterilização', grupo: 'variavel', icone: '🧤',
    chaves: ['luva', 'luvas', 'mascara', 'gaze', 'algodao', 'sugador', 'touca', 'avental', 'descartavel', 'descartaveis', 'epi', 'esterilizacao', 'grau cirurgico', 'envelope', 'alcool', 'babador'] },
  { id: 'laboratorio',  nome: 'Laboratório / protético',      grupo: 'variavel', icone: '🔬',
    chaves: ['laboratorio', 'protetico', 'protese', 'coroa', 'placa'] },
  { id: 'aluguel',      nome: 'Aluguel',                      grupo: 'fixa', icone: '🏠', chaves: ['aluguel'] },
  { id: 'condominio',   nome: 'Condomínio e IPTU',            grupo: 'fixa', icone: '🏢', chaves: ['condominio', 'iptu'] },
  { id: 'contas',       nome: 'Luz, água, internet e telefone', grupo: 'fixa', icone: '💡',
    chaves: ['luz', 'energia', 'agua', 'internet', 'telefone', 'celular', 'wifi', 'gas'] },
  { id: 'pessoal',      nome: 'Secretária, auxiliar e limpeza', grupo: 'fixa', icone: '👩‍💼',
    chaves: ['secretaria', 'auxiliar', 'asb', 'salario', 'funcionaria', 'funcionario', 'diarista', 'faxina', 'limpeza da clinica', 'vale transporte'] },
  { id: 'contador',     nome: 'Contador',                     grupo: 'fixa', icone: '📒', chaves: ['contador', 'contabilidade', 'contabil'] },
  { id: 'software',     nome: 'Sistemas e assinaturas',       grupo: 'fixa', icone: '📱', chaves: ['software', 'sistema', 'assinatura', 'aplicativo', 'app'] },
  { id: 'manutencao',   nome: 'Equipamentos e manutenção',    grupo: 'outros', icone: '🛠️',
    chaves: ['equipamento', 'manutencao', 'conserto', 'autoclave', 'compressor', 'cadeira', 'reparo', 'tecnico'] },
  { id: 'marketing',    nome: 'Marketing e Instagram',        grupo: 'outros', icone: '📣',
    chaves: ['marketing', 'instagram', 'anuncio', 'anuncios', 'trafego', 'fotografo', 'panfleto', 'impulsionamento', 'social media'] },
  { id: 'impostos',     nome: 'Impostos, CRO e taxas',        grupo: 'outros', icone: '🧾',
    chaves: ['imposto', 'impostos', 'das', 'simples nacional', 'iss', 'inss', 'carne leao', 'cro', 'anuidade', 'alvara', 'seguro'] },
  { id: 'cursos',       nome: 'Cursos e congressos',          grupo: 'outros', icone: '🎓', chaves: ['curso', 'cursos', 'congresso', 'especializacao', 'mentoria'] },
  { id: 'outros',       nome: 'Outros',                       grupo: 'outros', icone: '📦', chaves: [] },
  { id: 'retirada',     nome: 'Retirada pessoal (pró-labore)', grupo: 'retirada', icone: '👛', chaves: ['retirada', 'pro labore', 'prolabore'] }
];
export const CATEGORIA = Object.fromEntries(CATEGORIAS.map(c => [c.id, c]));

/* ---------- Procedimentos ----------
   retornoDias: sugestão de quando voltar a falar com o paciente (editável em Ajustes).
   Fontes: bulas de toxina (não reaplicar antes de 3 meses; usual 4–6), SBCP (AH 6–12+ meses),
   Manual MSD (profilaxia 6 meses), sutura de siso 7–10 dias. */
export const PROCEDIMENTOS_PADRAO = [
  { id: 'botox',        nome: 'Botox (toxina)',         area: 'estetica', retornoDias: 120, valor: 0, chaves: ['botox', 'toxina', 'botulinica'] },
  { id: 'labial',       nome: 'Preenchimento labial',   area: 'estetica', retornoDias: 270, valor: 0, chaves: ['preenchimento labial', 'labial', 'labio', 'labios', 'boca', 'preenchimento'] },
  { id: 'harmonizacao', nome: 'Harmonização facial',    area: 'estetica', retornoDias: 150, valor: 0, chaves: ['harmonizacao', 'harmonizar', 'full face', 'mandibula', 'mento', 'olheira', 'bigode chines', 'malar'] },
  { id: 'bioestimulador', nome: 'Bioestimulador',       area: 'estetica', retornoDias: 45,  valor: 0, chaves: ['bioestimulador', 'sculptra', 'radiesse', 'colageno'] },
  { id: 'skinbooster',  nome: 'Skinbooster',            area: 'estetica', retornoDias: 30,  valor: 0, chaves: ['skinbooster', 'skin booster'] },
  { id: 'limpeza',      nome: 'Limpeza (profilaxia)',   area: 'odonto',   retornoDias: 180, valor: 0, chaves: ['limpeza', 'profilaxia', 'tartaro', 'raspagem'] },
  { id: 'siso',         nome: 'Extração de siso',       area: 'odonto',   retornoDias: 7,   valor: 0, chaves: ['siso', 'extracao', 'extrai', 'extraí', 'exodontia', 'arranquei', 'tirei o dente', 'tirar o dente'] },
  { id: 'restauracao',  nome: 'Restauração',            area: 'odonto',   retornoDias: 180, valor: 0, chaves: ['restauracao', 'restaurei', 'restaurar', 'obturacao', 'carie'] },
  { id: 'clareamento',  nome: 'Clareamento',            area: 'odonto',   retornoDias: 180, valor: 0, chaves: ['clareamento', 'clarear', 'clareei'] },
  { id: 'canal',        nome: 'Canal (endodontia)',     area: 'odonto',   retornoDias: 30,  valor: 0, chaves: ['canal', 'endodontia'] },
  { id: 'consulta',     nome: 'Consulta / avaliação',   area: 'odonto',   retornoDias: 180, valor: 0, chaves: ['consulta', 'avaliacao', 'avaliei', 'revisao'] },
  { id: 'outro_est',    nome: 'Outro (estética)',       area: 'estetica', retornoDias: 90,  valor: 0, chaves: [] },
  { id: 'outro_odo',    nome: 'Outro (odontologia)',    area: 'odonto',   retornoDias: 180, valor: 0, chaves: [] }
];

export const AREAS = { estetica: 'Estética', odonto: 'Odontologia' };

/* ---------- Formas de pagamento (taxa % padrão da maquininha, editável) ---------- */
export const PAGAMENTOS = [
  { id: 'pix',       nome: 'Pix',                taxa: 0 },
  { id: 'dinheiro',  nome: 'Dinheiro',           taxa: 0 },
  { id: 'debito',    nome: 'Débito',             taxa: 1.5 },
  { id: 'credito',   nome: 'Crédito à vista',    taxa: 3.5 },
  { id: 'parcelado', nome: 'Crédito parcelado',  taxa: 7 },
  { id: 'boleto',    nome: 'Boleto / transferência', taxa: 0 }
];

/* Custos fixos que já vêm na lista (ela coloca os valores) */
export const FIXOS_PADRAO = [
  { descricao: 'Aluguel',    categoria: 'aluguel',    valor: 0, dia: 10 },
  { descricao: 'Condomínio', categoria: 'condominio', valor: 0, dia: 10 },
  { descricao: 'Energia',    categoria: 'contas',     valor: 0, dia: 15 },
  { descricao: 'Internet e telefone', categoria: 'contas', valor: 0, dia: 15 },
  { descricao: 'Contador',   categoria: 'contador',   valor: 0, dia: 5 }
];

/* Mensagem de retorno. Não cita o procedimento: a prévia do WhatsApp
   aparece na tela bloqueada e outras pessoas podem ver. */
export const MENSAGEM_PADRAO =
  'Oi, {nome}! Tudo bem? Aqui é a Dra. Rebeca 😊 Já está chegando a hora do seu retorno aqui no consultório. Quer que eu reserve um horário para você? Me fala o melhor dia.';

/* ---------- Dinheiro ---------- */
const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const brl = v => fmtBRL.format(Number(v) || 0);
export const brlCurto = v => {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1e6) return 'R$ ' + (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
  if (Math.abs(n) >= 1e4) return 'R$ ' + (n / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';
  return brl(n);
};
export const pct = v => (Number.isFinite(v) ? (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%' : '—');
/* "1.234,56" ou "1234.56" → 1234.56 */
export function numeroDe(texto) {
  if (typeof texto === 'number') return texto;
  let s = String(texto || '').replace(/[^\d,.-]/g, '');
  if (!s) return 0;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

/* ---------- Datas (sempre 'AAAA-MM-DD', no fuso do aparelho) ---------- */
const dois = n => String(n).padStart(2, '0');
export const isoDe = d => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
export const dataDe = iso => { const [a, m, d] = iso.split('-').map(Number); return new Date(a, m - 1, d); };
export const hoje = () => isoDe(new Date());
export const somaDias = (iso, n) => { const d = dataDe(iso); d.setDate(d.getDate() + n); return isoDe(d); };
export const somaMeses = (iso, n) => {
  const d = dataDe(iso); const dia = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dia, ultimo)); return isoDe(d);
};
export const diasEntre = (a, b) => Math.round((dataDe(b) - dataDe(a)) / 864e5);
export const mesDe = iso => iso.slice(0, 7);
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const nomeMes = ym => { const [a, m] = ym.split('-').map(Number); return `${MESES[m - 1]} de ${a}`; };
export const nomeMesCurto = ym => MESES[Number(ym.slice(5, 7)) - 1].slice(0, 3);
export const somaMesYM = (ym, n) => somaMeses(ym + '-01', n).slice(0, 7);
export const dataCurta = iso => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '';
export const dataLonga = iso => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '';
export function quando(iso, base = hoje()) {
  const d = diasEntre(base, iso);
  if (d === 0) return 'hoje';
  if (d === 1) return 'amanhã';
  if (d === -1) return 'ontem';
  if (d < 0) return `há ${-d} dias`;
  if (d < 60) return `em ${d} dias`;
  return `em ${Math.round(d / 30)} meses`;
}
/* "120 dias" → texto amigável */
export function textoPrazo(dias) {
  if (dias % 30 === 0 && dias >= 30) { const m = dias / 30; return m === 1 ? '1 mês' : `${m} meses`; }
  if (dias % 7 === 0 && dias >= 7 && dias < 60) { const s = dias / 7; return s === 1 ? '1 semana' : `${s} semanas`; }
  return dias === 1 ? '1 dia' : `${dias} dias`;
}

/* ---------- Texto ---------- */
export const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const primeiroNome = nome => String(nome || '').trim().split(/\s+/)[0] || '';
export const capitalizar = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
/* Telefone → só dígitos com 55 na frente (para o wa.me) */
export function telefoneWhats(tel) {
  let d = String(tel || '').replace(/\D/g, '');
  if (!d) return '';
  d = d.replace(/^0+/, '');
  if (d.length === 10 || d.length === 11) d = '55' + d;
  return d;
}
export function telefoneBonito(tel) {
  const d = String(tel || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel || '';
}

/* ---------- Contas do mês ----------
   Receita = valor cobrado nos atendimentos (competência: data do atendimento).
   Taxas = taxa da maquininha sobre cada atendimento.
   Despesas = tudo, menos retirada pessoal (que aparece à parte).
   Lucro líquido = receita − taxas − despesas. Margem = lucro ÷ receita. */
export function contasDoMes(ym, atendimentos, despesas) {
  const at = atendimentos.filter(a => !a.excluido && mesDe(a.data) === ym);
  const de = despesas.filter(d => !d.excluido && mesDe(d.data) === ym);
  const receita = soma(at, a => a.valor);
  const taxas = soma(at, a => (a.valor || 0) * (a.taxa || 0) / 100);
  const operacionais = de.filter(d => CATEGORIA[d.categoria]?.grupo !== 'retirada');
  const despesa = soma(operacionais, d => d.valor);
  const fixas = soma(operacionais.filter(d => CATEGORIA[d.categoria]?.grupo === 'fixa'), d => d.valor);
  const retiradas = soma(de.filter(d => CATEGORIA[d.categoria]?.grupo === 'retirada'), d => d.valor);
  const lucro = receita - taxas - despesa;
  const margem = receita > 0 ? lucro / receita : NaN;
  const aReceber = soma(at.filter(a => a.status === 'a_receber'), a => a.valor);
  const aPagar = soma(de.filter(d => d.status === 'a_pagar'), d => d.valor);
  const qtd = at.length;
  const ticket = qtd ? receita / qtd : 0;
  /* Ponto de equilíbrio em atendimentos: quantos atendimentos pagam todas as despesas,
     usando o ticket médio líquido de taxas e de insumos variáveis do mês. */
  const variaveis = despesa - fixas;
  const contribuicao = qtd ? (receita - taxas - variaveis) / qtd : 0;
  const equilibrio = contribuicao > 0 ? Math.ceil(fixas / contribuicao) : null;
  const porArea = { estetica: 0, odonto: 0 };
  const porProc = {};
  for (const a of at) {
    porArea[a.area] = (porArea[a.area] || 0) + (a.valor || 0);
    const p = (porProc[a.procedimento] ||= { qtd: 0, valor: 0 });
    p.qtd++; p.valor += a.valor || 0;
  }
  const porCategoria = {};
  for (const d of operacionais) porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + (d.valor || 0);
  return { receita, taxas, despesa, fixas, variaveis, retiradas, lucro, margem, aReceber, aPagar, qtd, ticket, equilibrio, porArea, porProc, porCategoria };
}
const soma = (lista, f) => Math.round(lista.reduce((s, x) => s + (Number(f(x)) || 0), 0) * 100) / 100;
