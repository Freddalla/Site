# Dipa

Diário com 36 pílulas de sabedoria (Buda, estoicos, Jesus, mitologia). Pagamento único.

| Arquivo | O que é |
|---|---|
| `index.html` | Página de vendas (o link da bio). O botão leva ao checkout. |
| `diario/index.html` | O diário. Só abre com a chave de acesso. |
| `diario/conteudo.js` | Pílulas, mantras, meditações e a configuração de acesso (`ACESSO`) e de marca (`MARCA`). |

## Colocar no ar (uma vez)

1. Junte esta branch na `main` e ative o GitHub Pages (Settings → Pages → branch `main`, pasta `/root`).
2. A página de vendas fica em `https://freddalla.github.io/Site/dipa/` e o diário em `https://freddalla.github.io/Site/dipa/diario/`.
3. Com domínio próprio (por exemplo `dipa.com.br`), o ideal é mover a pasta `dipa/` para um repositório só dela.

## Checkout (Kiwify, Hotmart ou outra plataforma)

1. Crie o produto "Dipa · o diário" por R$ 47, pagamento único, com garantia de 7 dias.
2. Na entrega do produto, use "link externo" ou o e-mail de acesso e coloque o link do diário com a chave:
   `https://freddalla.github.io/Site/dipa/diario/?k=SUA-CHAVE`
3. Copie o link de pagamento do produto e cole em `CONFIG.CHECKOUT_URL`, no fim de `index.html`.
4. Opcional: o ID do pixel do Meta em `CONFIG.META_PIXEL_ID` e o e-mail de suporte em `CONFIG.CONTATO`.

A chave não fica no código, só o hash dela (em `diario/conteudo.js`). Quem abre o link uma vez fica liberado naquele aparelho.

### Limite dessa proteção

O site é estático. A chave impede o acesso casual, mas quem comprar pode repassar o link. Para trocar a chave (por exemplo, se ela vazar), gere o SHA-256 da nova chave, substitua em `ACESSO.hashes` e atualize o link de entrega na plataforma. Quem já abriu continua com acesso.
