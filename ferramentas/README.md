# ferramentas/ · para você trabalhar

| Arquivo | Para que serve |
|---|---|
| `plano-de-lancamento.html` | **Comece aqui.** O negócio, o que fazer agora, as 4 primeiras semanas, Instagram, venda, Manhã Dipa e números |
| `fabrica-de-pilulas.html` | Escolha uma das 36 pílulas e baixe o carrossel de 6 slides com a legenda pronta |
| `instagram/` | As peças prontas em PNG, numeradas na ordem de uso (01 a 13) |
| `pecas.html` | A prancheta que desenha as peças do Instagram |
| `google-apps-script.gs` | O script que leva os formulários do site para uma Planilha Google |

## Ligar a lista da Manhã Dipa a uma planilha (15 min)

1. Crie uma Planilha Google chamada "Dipa · Listas".
2. Vá em **Extensões → Apps Script**, apague o que estiver lá e cole o conteúdo de `google-apps-script.gs`. Salve.
3. Clique em **Implantar → Nova implantação → App da Web**. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**.
4. Autorize e copie o endereço que termina em `/exec`.
5. Cole em `LISTA_URL`, no arquivo `dipa/config.js`.

A aba "Manhã Dipa" é criada sozinha na primeira inscrição.
