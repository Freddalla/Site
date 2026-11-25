/* =====================================================================
   CLÍNICA · dados de exemplo (só para demonstração)
   Usado quando a página define window.CLINICA_DEMO = true e o banco está vazio.
   Nomes e telefones são fictícios.
   ===================================================================== */
import * as db from './db.js';
import { hoje, somaDias, somaMeses, mesDe } from './dados.js';

export async function semearExemplo() {
  const h = hoje();
  const pacientes = [
    ['Ana Beatriz Lima', '27999990001'], ['Juliana Reis', '27999990002'], ['Marcos Vieira', '27999990003'],
    ['Fernanda Costa', '27999990004'], ['Patrícia Alves', '27999990005'], ['Lucas Martins', '27999990006'],
    ['Camila Duarte', '27999990007'], ['Roberta Nunes', '27999990008']
  ];
  const ids = [];
  for (const [nome, telefone] of pacientes) ids.push((await db.salvar('pacientes', { nome, telefone, aceitaWhats: true, exemplo: true })).id);

  /* [paciente, procedimento, dias atrás, valor, pagamento, taxa, status, retorno (dias a partir do atendimento) ] */
  const atend = [
    [0, 'botox', 122, 1500, 'pix', 0, 'recebido', 120],          // retorno vence ~hoje
    [1, 'labial', 275, 1800, 'parcelado', 7, 'recebido', 270],    // atrasado alguns dias
    [2, 'siso', 9, 650, 'debito', 1.5, 'recebido', 7],            // atrasado 2 dias
    [3, 'harmonizacao', 145, 4200, 'parcelado', 7, 'recebido', 150], // próximos dias
    [4, 'limpeza', 2, 280, 'pix', 0, 'recebido', 180],
    [5, 'restauracao', 1, 350, 'boleto', 0, 'a_receber', 180],
    [6, 'botox', 5, 1500, 'credito', 3.5, 'recebido', 120],
    [7, 'bioestimulador', 12, 2400, 'parcelado', 7, 'recebido', 45],
    [4, 'clareamento', 40, 900, 'pix', 0, 'recebido', 180],
    [6, 'labial', 70, 1700, 'credito', 3.5, 'recebido', 270],
    [2, 'limpeza', 100, 250, 'dinheiro', 0, 'recebido', 180]
  ];
  for (const [p, procedimento, atras, valor, pagamento, taxa, status, ret] of atend) {
    const data = somaDias(h, -atras);
    const area = ['botox', 'labial', 'harmonizacao', 'bioestimulador'].includes(procedimento) ? 'estetica' : 'odonto';
    const retorno = somaDias(data, ret);
    const velho = retorno < somaDias(h, -20);
    await db.salvar('atendimentos', { pacienteId: ids[p], procedimento, area, data, valor, pagamento, taxa, status, retorno, retornoFeito: velho, parcelas: pagamento === 'parcelado' ? 3 : null, exemplo: true });
  }
  /* receita dos meses anteriores, para o gráfico de 6 meses */
  const mensal = [9800, 11200, 10400, 12900, 11800];
  for (let i = 1; i <= 5; i++) {
    const dia = somaMeses(mesDe(h) + '-15', -i);
    const partes = [0.45, 0.35, 0.2];
    for (const [k, fr] of partes.entries()) {
      await db.salvar('atendimentos', { pacienteId: ids[(i + k) % ids.length], procedimento: ['botox', 'harmonizacao', 'limpeza'][k], area: k < 2 ? 'estetica' : 'odonto',
        data: somaDias(dia, k * 3), valor: Math.round(mensal[i - 1] * fr), pagamento: 'pix', taxa: 0, status: 'recebido', retorno: null, exemplo: true });
    }
  }
  /* despesas: fixas de cada mês + insumos */
  const fixos = await db.todos('fixos');
  const valores = { Aluguel: 2800, 'Condomínio': 650, Energia: 320, 'Internet e telefone': 180, Contador: 450 };
  for (const f of fixos) if (valores[f.descricao]) await db.salvar('fixos', { ...f, valor: valores[f.descricao] });
  for (let i = 0; i <= 5; i++) {
    const ym = mesDe(somaMeses(mesDe(h) + '-01', -i));
    for (const f of fixos) {
      const v = valores[f.descricao]; if (!v) continue;
      const data = `${ym}-${String(f.dia).padStart(2, '0')}`;
      if (i === 0 && f.descricao !== 'Aluguel' && f.descricao !== 'Condomínio') continue; // deixa alguns para "lançar fixos"
      await db.salvar('despesas', { fixoId: f.id, descricao: f.descricao, categoria: f.categoria, valor: v, data, vencimento: data, status: i === 0 && data >= h ? 'a_pagar' : 'pago', exemplo: true });
    }
    await db.salvar('despesas', { descricao: 'Toxina 100U, Dental Cremer', categoria: 'toxina', valor: 1890, data: `${ym}-08`, status: 'pago', exemplo: true });
    await db.salvar('despesas', { descricao: 'Luvas, gaze e sugadores', categoria: 'descartaveis', valor: 260, data: `${ym}-12`, status: 'pago', exemplo: true });
    if (i % 2 === 0) await db.salvar('despesas', { descricao: 'Ácido hialurônico (2 seringas)', categoria: 'preenchedor', valor: 1100, data: `${ym}-18`, status: 'pago', exemplo: true });
  }
  await db.salvar('despesas', { descricao: 'Resina e anestésico, Dental Speed', categoria: 'material', valor: 890.5, data: somaDias(h, -3), vencimento: somaDias(h, 3), status: 'a_pagar', exemplo: true });
}
