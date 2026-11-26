# Clínica · gestão do consultório da Dra. Rebeca

> **O app mudou de endereço.** Agora ele mora no repositório [Gestao-Clinica-Rebeca/gestaoclinicarebeca](https://github.com/Gestao-Clinica-Rebeca/gestaoclinicarebeca)
> e abre em https://gestao-clinica-rebeca.github.io/gestaoclinicarebeca/. Mudanças no app são feitas lá.
> Esta pasta só fica para quem abriu o endereço antigo: sem dados, vai direto para o novo; com dados, mostra como fazer o backup e restaurar lá.

App de celular (PWA) para:

- lançar **despesas** e **receitas** falando, escrevendo ou tirando foto da nota ou do boleto;
- ver **receita, despesas, lucro líquido e margem** de cada mês;
- acompanhar os **retornos** dos pacientes, com o botão de WhatsApp no dia certo.

Não tem servidor. Os dados ficam **só no celular dela**, e o backup é um arquivo criptografado.

## Como ela usa

| Quero… | Onde |
|---|---|
| Lançar qualquer coisa | Botão **+**. Fale ("atendi a Maria, botox, 1.500 no pix"), escreva ou tire foto. O app preenche e ela confere antes de salvar. |
| Lançar aluguel, condomínio etc. | **+ → Custos fixos do mês**. A lista e os valores de sempre ficam em Ajustes. |
| Ver quem precisa de retorno | **Início**. Retornos de hoje e atrasados, com o botão **WhatsApp** e a mensagem pronta. |
| Mudar a data de um retorno | No retorno, toque em **⋯ → Mudar a data**. Também dá para editar no atendimento. |
| Ser avisada com o app fechado | **⋯ → Pôr na agenda do celular**. No iPhone baixa um .ics; no Android abre o Google Agenda. |
| Ver se está valendo a pena | **Resumo**. Lucro, margem, ponto de equilíbrio ("faltam X atendimentos"), procedimentos, para onde foi o dinheiro e os últimos 6 meses. |
| Mandar para o contador | **Lançamentos** ou **Resumo → Baixar planilha do mês** (CSV que abre no Excel). |
| Não perder nada | **Ajustes → Fazer backup**, toda semana. A tela inicial avisa quando passa de 7 dias. |

### Como o lucro é calculado

```
Receita (valor cobrado nos atendimentos do mês)
− Taxas da maquininha (% por forma de pagamento, em Ajustes)
− Despesas do mês (menos "Retirada pessoal", que aparece à parte)
= Lucro líquido          Margem = lucro ÷ receita
```

O mês é o da **data** do atendimento ou da despesa, não a do pagamento. Uma venda parcelada entra inteira no mês do atendimento.
O vencimento serve para a lista de contas a pagar.

## Instalar no celular

1. Abra o endereço do app no **Safari** (iPhone) ou no **Chrome** (Android).
2. iPhone: **Compartilhar → Adicionar à Tela de Início**. Android: **Instalar app**.
3. Abra sempre pelo ícone. No iPhone, isso evita que o sistema apague os dados de sites que ficam sem uso.

## Leitura com IA (opcional)

Sem IA, o app entende frases simples sozinho (`interpretador.js`, sem internet) e guarda as fotos como anexo.
Com IA, ele também **lê a foto** da nota, do cupom ou do boleto (valor, data, vencimento, fornecedor) e entende frases mais soltas.

1. Crie uma conta em console.anthropic.com, cadastre um cartão e gere uma chave de API.
2. No app, abra **Ajustes → Leitura com IA**, cole a chave e toque em **Testar**.

- **Custo:** cada leitura de foto custa por volta de 1 a 3 centavos de dólar.
- **Modelo:** `claude-opus-5-5`, com esforço baixo e troca automática de modelo se a leitura for recusada.
- **Privacidade:** a chave fica só no celular. O texto e as fotos enviados para leitura passam pela Anthropic, nos EUA. O app avisa isso antes de ligar.

## Para quem mantém o código

```
clinica/
  index.html, app.css, app.js   telas
  dados.js                      categorias, procedimentos, retornos, contas do mês
  interpretador.js              entende frases em português sem internet
  ia.js                         leitura com IA (Claude), carregada só quando ligada
  db.js                         IndexedDB, backup criptografado (AES-GCM + PBKDF2)
  sw.js, manifest.webmanifest   funciona sem internet e instala como app
  vendor/anthropic-sdk-1.5.0.js SDK oficial da Anthropic, empacotado para o navegador
  testes/                       node testes/interpretador.test.js
```

- **Sem build.** É HTML, CSS e JS puro, servido pelo GitHub Pages.
- **Testes:** `cd clinica && npm test`.
- **Regra para as frases:** ao mudar o interpretador, acrescente a frase real que falhou como um caso em `testes/interpretador.test.js`.
- **Registros:** todo registro tem `id` (UUID), `criadoEm`, `atualizadoEm` e `excluido`. A sincronização em nuvem da fase 2 não vai exigir migração.

As decisões e o porquê de cada uma estão em [`DECISOES.md`](DECISOES.md).
