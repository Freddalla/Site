/* =====================================================================
   CLÍNICA · interpretador local (funciona sem internet e sem IA)
   Recebe o que ela falou ou escreveu e devolve uma lista de lançamentos
   para ela conferir. Ex.: "paguei 1.200 de aluguel e 450 de condomínio"
   ===================================================================== */
import { CATEGORIAS, PROCEDIMENTOS_PADRAO, semAcento, hoje, somaDias, somaMeses, capitalizar } from './dados.js';

/* ---------- 1. Números por extenso → algarismos ---------- */
const UNIDADES = { zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9,
  dez: 10, onze: 11, doze: 12, treze: 13, quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19 };
const DEZENAS = { vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90 };
const CENTENAS = { cem: 100, cento: 100, duzentos: 200, duzentas: 200, trezentos: 300, trezentas: 300, quatrocentos: 400, quatrocentas: 400,
  quinhentos: 500, quinhentas: 500, seiscentos: 600, seiscentas: 600, setecentos: 700, setecentas: 700, oitocentos: 800, oitocentas: 800,
  novecentos: 900, novecentas: 900 };
const valorPalavra = w => UNIDADES[w] ?? DEZENAS[w] ?? CENTENAS[w];
const ehNumeroPalavra = w => valorPalavra(w) !== undefined || w === 'mil';

/* Converte sequências como "mil e duzentos e cinquenta" em "1250".
   Também entende o jeito falado "um e quinhentos" = 1.500 e "dois e duzentos" = 2.200. */
export function extensoParaNumero(texto) {
  const palavras = texto.split(/(\s+)/);
  const saida = [];
  let i = 0;
  while (i < palavras.length) {
    const w = semAcento(palavras[i]);
    if (!ehNumeroPalavra(w) || (w === 'um' || w === 'uma') && !proximoEhNumero(palavras, i)) {
      /* "um"/"uma" sozinhos ficam como artigo ("uma limpeza") */
      saida.push(palavras[i]); i++; continue;
    }
    /* junta a sequência: palavra-número, espaços e "e" entre elas */
    const seq = [];
    let j = i, ultimoNumero = i;
    while (j < palavras.length) {
      const t = semAcento(palavras[j]);
      if (/^\s+$/.test(palavras[j]) || t === 'e') { j++; continue; }
      if (ehNumeroPalavra(t)) { seq.push(t); ultimoNumero = j; j++; continue; }
      break;
    }
    /* "2 mil": algarismo antes de "mil" fica como está (o leitor de valores entende) */
    if (seq.length === 1 && seq[0] === 'mil' && /\d\s*$/.test(saida.join(''))) { saida.push(palavras[i]); i++; continue; }
    saida.push(String(somarPalavras(seq)));
    i = ultimoNumero + 1;
  }
  return saida.join('');
}
function proximoEhNumero(palavras, i) {
  for (let j = i + 1; j < palavras.length && j < i + 6; j++) {
    const t = semAcento(palavras[j]);
    if (/^\s+$/.test(palavras[j]) || t === 'e') continue;
    return ehNumeroPalavra(t);
  }
  return false;
}
function somarPalavras(seq) {
  let total = 0, atual = 0;
  for (const w of seq) {
    if (w === 'mil') { total += (atual || 1) * 1000; atual = 0; }
    else atual += valorPalavra(w);
  }
  /* "um e quinhentos": unidade seguida de centena, sem "mil" → milhar implícito */
  if (!seq.includes('mil') && seq.length >= 2 && UNIDADES[seq[0]] >= 1 && UNIDADES[seq[0]] <= 9 && CENTENAS[seq[1]]) {
    return UNIDADES[seq[0]] * 1000 + seq.slice(1).reduce((s, w) => s + valorPalavra(w), 0);
  }
  return total + atual;
}

/* ---------- 2. Valores em dinheiro ---------- */
/* Acha os valores do trecho e ignora números que são dia, parcelas ou telefone. */
const RE_VALOR = /(r\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?(\s*(?:mil|k)\b)?(\s*(?:reais|real|conto|contos|pila)\b)?(\s*e\s*(\d{1,2})\s*centavos)?/gi;
export function acharValores(trecho) {
  const t = semAcento(trecho);
  const achados = [];
  for (const m of t.matchAll(RE_VALOR)) {
    const antes = t.slice(Math.max(0, m.index - 12), m.index);
    const depois = t.slice(m.index + m[0].length, m.index + m[0].length + 10);
    const inteiro = m[2].replace(/\./g, '');
    /* números que não são dinheiro */
    if (inteiro.length >= 8) continue;                                           // telefone
    if (/\b(dia|dias|dia de|em|para|pra)\s*$/.test(antes) && !m[1] && !m[5] && /^\s*(\/|de\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)|dias?\b|semanas?\b|mes(es)?\b|meses\b|anos?\b)/.test(depois + ' ')) continue;
    if (/\bdia\s*$/.test(antes) && !m[1] && !m[5]) continue;                     // "dia 10"
    if (/^\s*(x\b|vezes|parcelas?)/.test(depois) && !m[1]) continue;             // "3x", "3 vezes"
    if (/^\s*(dias?|semanas?|mes(es)?|meses|anos?|horas?|unidades|unidade|ml|u\b|%|por cento|frascos?|caixas?|seringas?|ampolas?|pacotes?|kits?|pecas?|tubos?|rolos?|vidros?|potes?|pares?|un\b|und\b|x\b)/.test(depois) && !m[1] && !m[5]) continue;
    if (/^\s*\/\s*\d/.test(depois)) continue;                                   // "10/12"
    if (/\/\s*$/.test(antes)) continue;
    let v = Number(inteiro) + (m[3] ? Number(m[3].padEnd(2, '0')) / 100 : 0);
    if (m[4]) v *= 1000;
    if (m[7]) v += Number(m[7]) / 100;
    const forte = !!(m[1] || m[4] || m[5]);
    achados.push({ valor: Math.round(v * 100) / 100, forte, inicio: m.index, fim: m.index + m[0].length });
  }
  return achados;
}
function melhorValor(trecho) {
  const vs = acharValores(trecho);
  if (!vs.length) return null;
  const fortes = vs.filter(v => v.forte);
  if (fortes.length) return fortes[0];
  /* sem "R$" nem "reais": o valor depois de "por/de/foi/deu" vale mais; senão, o maior */
  const indicado = vs.find(v => /\b(por|foi|deu|custou|total|valor)\s*$/.test(semAcento(trecho).slice(Math.max(0, v.inicio - 10), v.inicio)));
  return indicado || vs.reduce((a, b) => (b.valor > a.valor ? b : a));
}

/* ---------- 3. Datas ---------- */
const MESES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function dataDoDia(dia, mes, ano, base) {
  const [ba, bm] = base.split('-').map(Number);
  let a = ano ? (ano < 100 ? 2000 + ano : ano) : ba;
  let m = mes || bm;
  if (dia < 1 || dia > 31 || m < 1 || m > 12) return null;
  return `${a}-${String(m).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
function acharData(t, base) {
  if (/\banteontem\b/.test(t)) return somaDias(base, -2);
  if (/\bontem\b/.test(t)) return somaDias(base, -1);
  let m = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (m && !/venc/.test(t.slice(Math.max(0, m.index - 14), m.index))) return dataDoDia(+m[1], +m[2], m[3] && +m[3], base);
  m = t.match(/\bdia\s+(\d{1,2})(?:\s+de\s+([a-z]{3})[a-z]*)?/);
  if (m && !/venc|pagar ate|ate o/.test(t.slice(Math.max(0, m.index - 14), m.index))) {
    const mes = m[2] ? MESES_CURTO.indexOf(m[2]) + 1 : 0;
    return dataDoDia(+m[1], mes, 0, base);
  }
  return null;
}
function acharVencimento(t, base) {
  const m = t.match(/(?:vence|vencimento|venc\.?|pagar ate|ate o dia|ate dia)\s*(?:em|no|o|dia|:)?\s*(?:dia\s*)?(\d{1,2})(?:\/(\d{1,2})(?:\/(\d{2,4}))?|\s+de\s+([a-z]{3})[a-z]*)?/);
  if (!m) {
    if (/\bvence hoje\b/.test(t)) return base;
    if (/\bvence amanha\b/.test(t)) return somaDias(base, 1);
    return null;
  }
  let mes = m[2] ? +m[2] : m[4] ? MESES_CURTO.indexOf(m[4]) + 1 : 0;
  let data = dataDoDia(+m[1], mes, m[3] && +m[3], base);
  /* "vence dia 5" quando hoje já é dia 20 → mês que vem */
  if (data && !m[3] && data < base) data = somaMeses(data, mes ? 12 : 1);
  return data;
}
function acharRetorno(t, base) {
  const m = t.match(/(?:retorno|retornar|voltar|volta|revisao|reaplicacao|reaplicar)\D{0,20}?(\d{1,3})\s*(dias?|semanas?|mes(?:es)?|meses|anos?)/);
  if (!m) return null;
  const n = +m[1], u = m[2];
  if (u.startsWith('dia')) return somaDias(base, n);
  if (u.startsWith('semana')) return somaDias(base, n * 7);
  if (u.startsWith('ano')) return somaMeses(base, n * 12);
  return somaMeses(base, n);
}

/* ---------- 4. Classificação ---------- */
const contem = (t, chave) => new RegExp(`(^|[^a-z])${chave.replace(/\s+/g, '\\s+')}([^a-z]|$)`).test(t);
export function acharCategoria(t) {
  let melhor = null, tamanho = 0;
  for (const c of CATEGORIAS) for (const k of c.chaves) if (k.length > tamanho && contem(t, semAcento(k))) { melhor = c.id; tamanho = k.length; }
  return melhor;
}
export function acharProcedimento(t, procedimentos = PROCEDIMENTOS_PADRAO) {
  let melhor = null, tamanho = 0;
  for (const p of procedimentos) {
    const chaves = [...(p.chaves || []), semAcento(p.nome)];
    for (const k of chaves) if (k && k.length > tamanho && contem(t, semAcento(k))) { melhor = p.id; tamanho = k.length; }
  }
  return melhor;
}
function acharPagamento(t) {
  const parc = t.match(/\b(\d{1,2})\s*(?:x\b|vezes|parcelas)/);
  if (parc && +parc[1] > 1) return { pagamento: 'parcelado', parcelas: +parc[1] };
  if (/parcelad/.test(t)) return { pagamento: 'parcelado', parcelas: null };
  if (/\bpix\b/.test(t)) return { pagamento: 'pix' };
  if (/\bdebito\b/.test(t)) return { pagamento: 'debito' };
  if (/\bcredito\b|\bcartao\b|maquininha/.test(t)) return { pagamento: 'credito' };
  if (/\bdinheiro\b|\bespecie\b|\bcash\b/.test(t)) return { pagamento: 'dinheiro' };
  if (/\bboleto\b|transferencia|\bted\b|\bdoc\b/.test(t)) return { pagamento: 'boleto' };
  return { pagamento: null };
}
const VERBO_DESPESA = /\b(paguei|gastei|gasto|comprei|compra|custou|custo|conta|boleto|despesa|vence|vencimento|debitou|mensalidade|fatura)\b/;
const VERBO_ATEND = /\b(atendi|atendimento|recebi|cobrei|paciente|cliente|fiz|fizemos|aplicacao|apliquei|consulta|procedimento|ganhei)\b/;

/* Nome do paciente: logo depois de "atendi", "paciente", "a/o", etc. Usa o texto original (com maiúsculas). */
function acharPaciente(original) {
  const NOME = "([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõçü']+(?:\\s+(?:d[aeo]s?\\s+)?[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõçü']+){0,3})";
  const pistas = [
    new RegExp(`(?:atendi|atendimento d[aeo]|paciente|cliente|recebi d[aeo]|cobrei d[aeo]|fiz (?:um |uma |o |a )?[^,.]{0,30}? (?:n[ao]|d[ao]|pr[ao]|para [ao]))\\s+(?:[ao]\\s+|d[aeo]\\s+|seu\\s+|dona\\s+|sr\\.?\\s+|sra\\.?\\s+)?${NOME}`),
    new RegExp(`\\b(?:d[ao]|n[ao]|pra|para)\\s+${NOME}`)
  ];
  for (const re of pistas) {
    const m = original.match(re);
    if (m && !/^(Pix|Botox|Hoje|Ontem|Dra|Doutora|Rebeca)$/.test(m[1])) return m[1];
  }
  /* sem maiúsculas (ditado às vezes vem tudo minúsculo) */
  const m = semAcento(original).match(/\b(?:atendi|paciente)\s+(?:a |o )?([a-z]{3,})(?:\s+([a-z]{3,}))?/);
  if (m && !/^(botox|limpeza|hoje|ontem|uma|um|com)$/.test(m[1])) {
    const sobrenome = m[2] && !/^(botox|limpeza|hoje|ontem|com|fiz|de|no|na|pix|que|e)$/.test(m[2]) ? ' ' + capitalizar(m[2]) : '';
    return capitalizar(m[1]) + sobrenome;
  }
  return null;
}

/* Texto de descrição de uma despesa: o trecho sem verbos e sem o valor */
function descricaoDe(trecho, valor, categoria) {
  let t = trecho;
  if (valor) t = t.slice(0, valor.inicio) + ' ' + t.slice(valor.fim);
  const B = '(?<![\\p{L}\\d])', F = '(?![\\p{L}\\d])';
  t = t.replace(new RegExp(B + '(eu|hoje|ontem|anteontem|paguei|gastei|comprei|lancei|lanca|lança|lancar|lançar|anota|anotar|coloca|colocar|registra|registrar|foi|foram|deu|custou|mais|tambem|também|reais|real|r\$|com|no|na|em|de|do|da|dos|das|o|a|os|as|um|uma|pix|cartao|cartão|debito|débito|credito|crédito|dinheiro|que|ja|já|pago|paga|por|para|pra)' + F, 'giu'), ' ');
  t = t.replace(/\b(vence|vencimento)\b.*$/i, ' ').replace(/\b(dia\s+\d{1,2}|\d{1,2}\/\d{1,2}(\/\d{2,4})?)\b/g, ' ');
  t = t.replace(/[^\p{L}\d\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (t.length < 3 && categoria) return CATEGORIAS.find(c => c.id === categoria).nome;
  return capitalizar(t).slice(0, 60);
}

/* ---------- 5. Quebrar o texto em lançamentos ---------- */
function quebrar(texto) {
  /* separa em frases e em " e " / ", " ; depois junta pedaços sem valor ao vizinho */
  const pedacos = texto
    .split(/(?:[;\n]|\.(?=\s|$)|,\s+|\s+e\s+)/i)
    .map(s => s && s.trim()).filter(Boolean);
  const grupos = [];
  let atual = null;
  for (const p of pedacos) {
    const temValor = acharValores(p).length > 0;
    const verbo = VERBO_DESPESA.test(semAcento(p)) || VERBO_ATEND.test(semAcento(p));
    if (!atual) { atual = { texto: p, valor: temValor }; continue; }
    if (temValor && atual.valor) { grupos.push(atual); atual = { texto: p, valor: true }; continue; }
    if (!temValor && atual.valor && verbo && /^(paguei|gastei|comprei|recebi|atendi|fiz)/.test(semAcento(p))) {
      grupos.push(atual); atual = { texto: p, valor: false }; continue;
    }
    atual.texto += ', ' + p; atual.valor = atual.valor || temValor;
  }
  if (atual) grupos.push(atual);
  return grupos.map(g => g.texto);
}

/* ---------- 6. Função principal ---------- */
export function interpretar(texto, { base = hoje(), procedimentos = PROCEDIMENTOS_PADRAO } = {}) {
  let limpo = extensoParaNumero(String(texto || '').trim());
  if (!limpo) return [];
  /* telefones saem do texto antes de procurar valores */
  const telefones = [];
  limpo = limpo.replace(/(?:\+?55[\s-]*)?\(?\b\d{2}\)?[\s-]*9?\d{4}[\s.-]*\d{4}\b/g, m => { telefones.push(m.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')); return ' '; })
    .replace(/\b(telefone|whats(?:app)?|zap|celular|fone)\s*(?=[,.;]|$)/gi, '').replace(/\s+,/g, ',');
  const tudo = semAcento(limpo);
  const dataGeral = acharData(tudo, base) || base;
  const itens = [];
  for (const trecho of quebrar(limpo)) {
    const t = semAcento(trecho);
    const valor = melhorValor(trecho);
    const categoria = acharCategoria(t);
    const procedimento = acharProcedimento(t, procedimentos);
    const ehDespesa = VERBO_DESPESA.test(t) && !/\b(recebi|atendi|cobrei)\b/.test(t);
    const ehAtend = !ehDespesa && (VERBO_ATEND.test(t) || (procedimento && !categoria) || (procedimento && /\b(n[ao]|d[ao]) [A-Z]/.test(trecho)));
    const data = acharData(t, base) || dataGeral;
    const pag = acharPagamento(t);
    if (ehAtend) {
      const proc = procedimentos.find(p => p.id === procedimento);
      itens.push({
        tipo: 'atendimento',
        paciente: acharPaciente(trecho) || acharPaciente(limpo),
        telefone: telefones.shift() || null,
        procedimento: procedimento || null,
        area: proc?.area || null,
        valor: valor?.valor ?? null,
        data,
        pagamento: pag.pagamento,
        parcelas: pag.parcelas || null,
        status: /(vai pagar|vai me pagar|fica(?:ndo|ou)? devendo|a receber|depois|pendente|fiado|nao pagou|ainda nao pagou|vai transferir)/.test(t) ? 'a_receber' : 'recebido',
        retorno: acharRetorno(t, data),
        origem: trecho
      });
    } else {
      if (!valor && !categoria) continue;
      const cat = categoria || (procedimento && ['botox', 'labial', 'bioestimulador', 'skinbooster', 'harmonizacao'].includes(procedimento) ? (procedimento === 'botox' ? 'toxina' : 'preenchedor') : 'outros');
      itens.push({
        tipo: 'despesa',
        descricao: descricaoDe(trecho, valor, cat),
        categoria: cat,
        valor: valor?.valor ?? null,
        data,
        vencimento: acharVencimento(t, base),
        status: /(falta pagar|a pagar|ainda nao paguei|nao paguei|vou pagar|pendente|vence|vencimento|boleto)/.test(t) && !/\b(paguei|pago)\b/.test(t) ? 'a_pagar' : 'pago',
        pagamento: pag.pagamento,
        origem: trecho
      });
    }
  }
  return itens;
}
