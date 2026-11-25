/* =====================================================================
   CLÍNICA · leitura com IA (opcional, desligada por padrão)
   Usa a API do Claude direto do celular, com a chave guardada só no aparelho.
   Lê o texto ditado e as fotos de nota, cupom e boleto, e devolve os
   lançamentos no mesmo formato do interpretador local.
   ===================================================================== */
import { CATEGORIAS, PAGAMENTOS, hoje } from './dados.js';

const MODELO = 'claude-opus-5-5';
let Anthropic; // o SDK só é carregado quando a IA é usada
async function cliente(chave) {
  if (!Anthropic) Anthropic = (await import('./vendor/anthropic-sdk-1.5.0.js')).default;
  return new Anthropic({ apiKey: chave, dangerouslyAllowBrowser: true, maxRetries: 1, timeout: 60_000 });
}

const texto = { type: ['string', 'null'] };
const ESQUEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['itens'],
  properties: {
    itens: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['tipo', 'descricao', 'valor', 'data', 'vencimento', 'categoria', 'status', 'paciente', 'telefone', 'procedimento', 'pagamento', 'parcelas', 'retorno'],
        properties: {
          tipo: { type: 'string', enum: ['atendimento', 'despesa'] },
          descricao: texto,
          valor: { type: ['number', 'null'] },
          data: texto,
          vencimento: texto,
          categoria: texto,
          status: { type: 'string', enum: ['pago', 'a_pagar', 'recebido', 'a_receber'] },
          paciente: texto,
          telefone: texto,
          procedimento: texto,
          pagamento: texto,
          parcelas: { type: ['integer', 'null'] },
          retorno: texto
        }
      }
    }
  }
};

function instrucoes(procedimentos) {
  return `Você ajuda a Dra. Rebeca, dentista que também faz estética facial, a lançar as finanças do consultório.
Transforme o que ela disse, ou a foto que ela mandou, em lançamentos. Hoje é ${hoje()}.

Tipos:
- "despesa": algo que ela pagou ou vai pagar (material, botox comprado, aluguel, condomínio, conta, boleto, nota fiscal de fornecedor).
- "atendimento": um paciente atendido, com o valor cobrado (receita).

Campos:
- valor: número em reais (1.200,50 → 1200.5). Em nota ou cupom, use o TOTAL a pagar. null se não houver.
- data: AAAA-MM-DD do gasto ou do atendimento. Na nota, a data de emissão. Sem data, use hoje.
- vencimento: AAAA-MM-DD, só para boleto ou conta a vencer; senão null.
- status: despesa = "pago" ou "a_pagar" (boleto ainda não pago = "a_pagar"); atendimento = "recebido" ou "a_receber".
- categoria (só despesa), um destes ids: ${CATEGORIAS.map(c => `${c.id} (${c.nome})`).join('; ')}.
- descricao (só despesa): curta, com o fornecedor quando houver. Ex.: "Toxina botulínica, Dental Cremer".
- procedimento (só atendimento), um destes ids: ${procedimentos.map(p => `${p.id} (${p.nome})`).join('; ')}.
- pagamento, um destes ids ou null: ${PAGAMENTOS.map(p => p.id).join(', ')}. parcelas: número de parcelas no cartão, ou null.
- paciente: nome como ela falou; telefone: só dígitos com DDD, ou null.
- retorno: AAAA-MM-DD só se ela disser quando o paciente deve voltar; senão null.
Uma frase pode ter vários lançamentos ("paguei 1.200 de aluguel e 450 de condomínio" = 2 despesas).
Nunca invente valores. Se a foto não for de nota, cupom, boleto ou comprovante, devolva itens vazio.`;
}

async function chamar(chave, conteudo, procedimentos) {
  const c = await cliente(chave);
  let resposta;
  try {
    resposta = await c.beta.messages.create({
      model: MODELO,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: ESQUEMA } },
      system: instrucoes(procedimentos),
      messages: [{ role: 'user', content: conteudo }]
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error('A chave da IA não foi aceita. Confira em Ajustes.');
    if (e instanceof Anthropic.PermissionDeniedError) throw new Error('A conta da IA não tem permissão ou está sem crédito.');
    if (e instanceof Anthropic.RateLimitError) throw new Error('Muitos pedidos seguidos para a IA. Tente de novo em um minuto.');
    if (e instanceof Anthropic.APIConnectionError) throw new Error('Sem conexão com a IA agora.');
    if (e instanceof Anthropic.APIError) throw new Error('A IA não conseguiu ler agora (' + (e.status || 'erro') + ').');
    throw e;
  }
  if (resposta.stop_reason === 'refusal') throw new Error('A IA preferiu não ler este conteúdo. Lance à mão.');
  const bloco = resposta.content.find(b => b.type === 'text');
  if (!bloco) throw new Error('A IA não devolveu nada.');
  const { itens } = JSON.parse(bloco.text);
  return limpar(itens, procedimentos);
}

/* Confere o que veio da IA: ids válidos, datas no formato certo, valores positivos */
const dataOk = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null);
function limpar(itens, procedimentos) {
  const cats = new Set(CATEGORIAS.map(c => c.id));
  const procs = new Map(procedimentos.map(p => [p.id, p]));
  const pags = new Set(PAGAMENTOS.map(p => p.id));
  return (itens || []).map(i => {
    const valor = typeof i.valor === 'number' && i.valor > 0 ? Math.round(i.valor * 100) / 100 : null;
    const base = { valor, data: dataOk(i.data) || hoje(), pagamento: pags.has(i.pagamento) ? i.pagamento : null };
    if (i.tipo === 'atendimento') {
      const proc = procs.get(i.procedimento);
      return { tipo: 'atendimento', ...base, paciente: i.paciente || null, telefone: (i.telefone || '').replace(/\D/g, '') || null,
        procedimento: proc ? proc.id : null, area: proc?.area || null, parcelas: i.parcelas || null,
        status: i.status === 'a_receber' ? 'a_receber' : 'recebido', retorno: dataOk(i.retorno) };
    }
    return { tipo: 'despesa', ...base, descricao: i.descricao || '', categoria: cats.has(i.categoria) ? i.categoria : 'outros',
      vencimento: dataOk(i.vencimento), status: i.status === 'a_pagar' ? 'a_pagar' : 'pago' };
  });
}

export function entenderTexto(chave, frase, procedimentos) {
  return chamar(chave, [{ type: 'text', text: frase }], procedimentos);
}

export async function entenderImagem(chave, imagemBase64, tipo, procedimentos, observacao = '') {
  const media = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(tipo) ? tipo : 'image/jpeg';
  const conteudo = tipo === 'application/pdf'
    ? [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: imagemBase64 } }]
    : [{ type: 'image', source: { type: 'base64', media_type: media, data: imagemBase64 } }];
  conteudo.push({ type: 'text', text: 'Leia este documento (nota, cupom, boleto ou comprovante) e lance.' + (observacao ? ' Ela disse: ' + observacao : '') });
  return chamar(chave, conteudo, procedimentos);
}
