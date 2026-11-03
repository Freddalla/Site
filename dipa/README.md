# dipa/ · o que o público vê

| Arquivo | O que é |
|---|---|
| `index.html` | Página de vendas do diário (o link da bio) |
| `config.js` | **O único arquivo para editar:** link de pagamento, planilha da lista, pixel e e-mail |
| `diario/index.html` | O diário. Só abre com a chave de acesso |
| `diario/conteudo.js` | As 36 pílulas, mantras, meditações e o hash da chave (`ACESSO`) |
| `manha/index.html` | Manhã Dipa: o encontro presencial e a lista de interessados |
| `marca/simbolo.js` | O símbolo (Atol). Trocar aqui troca em todas as páginas |
| `marca/*.png` | Foto de perfil, ícone do app e imagem de compartilhamento |

## Configurar (`config.js`)

- `CHECKOUT_URL`: link de pagamento do produto na Kiwify.
- `LISTA_URL`: endereço do Google Apps Script que grava a lista da Manhã Dipa (veja `ferramentas/README.md`).
- `META_PIXEL_ID`: ID do pixel do Meta, se for anunciar.
- `CONTATO`: e-mail de suporte que aparece no rodapé.

## Acesso ao diário

O comprador recebe da Kiwify o link `https://freddalla.github.io/Site/dipa/diario/?k=CHAVE`. Só o hash da chave fica no código. Quem abre o link uma vez fica liberado naquele aparelho. Para trocar a chave, gere o SHA-256 da nova e substitua em `ACESSO.hashes`, em `diario/conteudo.js`.
