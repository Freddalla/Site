/* Rode com: node testes/interpretador.test.js  (dentro de clinica/) */
import assert from 'node:assert/strict';
import { interpretar, extensoParaNumero } from '../interpretador.js';
import { contasDoMes } from '../dados.js';

const base = '2026-11-20';
const so = (txt) => interpretar(txt, { base });
let ok = 0, falhas = 0;
function caso(nome, fn) { try { fn(); ok++; } catch (e) { falhas++; console.log('✗', nome, '\n ', e.message.split('\n').slice(0, 6).join('\n  ')); } }
const parte = (obj, esperado) => { for (const [k, v] of Object.entries(esperado)) assert.deepEqual(obj[k], v, `${k}: ${JSON.stringify(obj[k])} ≠ ${JSON.stringify(v)} em ${JSON.stringify(obj)}`); };

caso('extenso', () => {
  assert.equal(extensoParaNumero('mil e duzentos reais'), '1200 reais');
  assert.equal(extensoParaNumero('um e quinhentos'), '1500');
  assert.equal(extensoParaNumero('trezentos e cinquenta'), '350');
  assert.equal(extensoParaNumero('dois mil e quinhentos'), '2500');
  assert.equal(extensoParaNumero('fiz uma limpeza'), 'fiz uma limpeza');
});
caso('aluguel simples', () => { const r = so('paguei 1.200 de aluguel'); assert.equal(r.length, 1); parte(r[0], { tipo: 'despesa', categoria: 'aluguel', valor: 1200, status: 'pago', data: base }); });
caso('duas despesas', () => { const r = so('Paguei R$ 1.200,00 de aluguel e 450 de condomínio'); assert.equal(r.length, 2); parte(r[0], { categoria: 'aluguel', valor: 1200 }); parte(r[1], { categoria: 'condominio', valor: 450 }); });
caso('botox compra', () => { const r = so('comprei 3 frascos de botox por 2.400 reais'); assert.equal(r.length, 1); parte(r[0], { tipo: 'despesa', categoria: 'toxina', valor: 2400 }); });
caso('por extenso', () => { const r = so('gastei mil e duzentos reais com material de dentista'); parte(r[0], { tipo: 'despesa', categoria: 'material', valor: 1200 }); });
caso('um e quinhentos', () => { const r = so('o aluguel foi um e quinhentos'); parte(r[0], { categoria: 'aluguel', valor: 1500 }); });
caso('atendimento botox', () => { const r = so('Atendi a Maria Souza, botox, 1.500 no pix'); assert.equal(r.length, 1); parte(r[0], { tipo: 'atendimento', paciente: 'Maria Souza', procedimento: 'botox', valor: 1500, pagamento: 'pix', status: 'recebido' }); });
caso('atendimento minúsculo', () => { const r = so('atendi a joana limpeza 250 reais no débito'); parte(r[0], { tipo: 'atendimento', paciente: 'Joana', procedimento: 'limpeza', valor: 250, pagamento: 'debito' }); });
caso('parcelado', () => { const r = so('Fiz preenchimento labial na Carla, 1800 em 3x no cartão'); parte(r[0], { tipo: 'atendimento', paciente: 'Carla', procedimento: 'labial', valor: 1800, pagamento: 'parcelado', parcelas: 3 }); });
caso('siso a receber', () => { const r = so('extração de siso do Pedro Henrique, 600 reais, ele vai pagar semana que vem'); parte(r[0], { tipo: 'atendimento', paciente: 'Pedro Henrique', procedimento: 'siso', valor: 600, status: 'a_receber' }); });
caso('boleto vencimento', () => { const r = so('boleto da dental cremer de 890,50 vence dia 28'); parte(r[0], { tipo: 'despesa', categoria: 'outros', valor: 890.5, status: 'a_pagar', vencimento: '2026-11-28' }); });
caso('vencimento mês seguinte', () => { const r = so('conta de luz 320 vence dia 5'); parte(r[0], { categoria: 'contas', valor: 320, vencimento: '2026-12-05' }); });
caso('ontem', () => { const r = so('ontem gastei 80 reais de luva'); parte(r[0], { categoria: 'descartaveis', valor: 80, data: '2026-11-19' }); });
caso('retorno em meses', () => { const r = so('atendi a Ana, botox 1200, retorno em 4 meses'); parte(r[0], { tipo: 'atendimento', valor: 1200, retorno: '2027-03-20' }); });
caso('mil', () => { const r = so('paguei 2 mil de secretária'); parte(r[0], { categoria: 'pessoal', valor: 2000 }); });
caso('misto', () => { const r = so('recebi 350 da limpeza da Bruna e paguei 120 de internet'); assert.equal(r.length, 2); parte(r[0], { tipo: 'atendimento', valor: 350, procedimento: 'limpeza', paciente: 'Bruna' }); parte(r[1], { tipo: 'despesa', categoria: 'contas', valor: 120 }); });
caso('data explícita', () => { const r = so('dia 3 paguei 600 do contador'); parte(r[0], { categoria: 'contador', valor: 600, data: '2026-11-03' }); });
caso('telefone não vira valor', () => { const r = so('atendi a Lia telefone 27 99700 6522, restauração 300'); parte(r[0], { valor: 300, telefone: '27997006522', procedimento: 'restauracao' }); });
caso('contas do mês', () => {
  const at = [{ data: '2026-11-02', valor: 1000, taxa: 3.5, area: 'estetica', procedimento: 'botox' }, { data: '2026-11-05', valor: 500, taxa: 0, area: 'odonto', procedimento: 'limpeza' }];
  const de = [{ data: '2026-11-10', valor: 600, categoria: 'aluguel' }, { data: '2026-11-11', valor: 200, categoria: 'toxina' }, { data: '2026-11-12', valor: 999, categoria: 'retirada' }];
  const c = contasDoMes('2026-11', at, de);
  assert.equal(c.receita, 1500); assert.equal(c.taxas, 35); assert.equal(c.despesa, 800); assert.equal(c.lucro, 665); assert.equal(c.retiradas, 999);
  assert.equal(Math.round(c.margem * 1000), 443); assert.equal(c.equilibrio, 1);
});
caso('dois atendimentos', () => { const r = so('limpeza da Paula 280 pix e restauração do João 350 vai pagar depois'); assert.equal(r.length, 2); parte(r[0], { paciente: 'Paula', procedimento: 'limpeza', valor: 280, status: 'recebido' }); parte(r[1], { paciente: 'João', procedimento: 'restauracao', valor: 350, status: 'a_receber' }); });
caso('vencimento ano que vem', () => { const r = so('anuidade do CRO 780 vence dia 30/01'); parte(r[0], { categoria: 'impostos', vencimento: '2027-01-30' }); });
caso('descartáveis', () => { const r = so('gastei 85 reais com gaze e luva na dental speed'); assert.equal(r.length, 1); parte(r[0], { categoria: 'descartaveis', valor: 85 }); });
caso('atender e fazer', () => { const r = so('atendi a Ana e fiz botox, 1200'); assert.equal(r.length, 1); parte(r[0], { paciente: 'Ana', procedimento: 'botox', valor: 1200 }); });
caso('secretária por extenso', () => { const r = so('paguei a secretária, dois mil e trezentos'); parte(r[0], { categoria: 'pessoal', valor: 2300 }); });
caso('frascos não são valor', () => { const r = so('comprei 2 frascos de botox por 1.900'); assert.equal(r.length, 1); parte(r[0], { categoria: 'toxina', valor: 1900 }); });
caso('caixas de luva', () => { const r = so('gastei 3 caixas de luva 120'); parte(r[0], { categoria: 'descartaveis', valor: 120 }); });
console.log(`\n${ok} ok, ${falhas} falha(s)`);
process.exit(falhas ? 1 : 0);
