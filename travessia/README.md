# Travessia

Marca-movimento contra a vida no piloto automático. Primeiro produto: **Travessia Norte**, uma jornada de 30 dias para uma turma fundadora de 15 pessoas.

| Arquivo | O que é |
|---|---|
| `index.html` | Landing page de validação com o Diagnóstico de Deriva (quiz), a lista de espera, a pesquisa de preço e o pixel do Meta |
| `plano.html` | Plano de rota com marca, mercado, modelo de negócio, validação com anúncios, Instagram e os próximos 30 dias |
| `google-apps-script.gs` | Script que grava os cadastros numa Planilha Google |

## 1. Ligar a lista de espera a uma planilha (15 min, grátis)

1. Crie uma Planilha Google chamada **Travessia · Lista**.
2. No menu, vá em **Extensões → Apps Script**, apague o conteúdo e cole o `google-apps-script.gs`. Salve.
3. Clique em **Implantar → Nova implantação → App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Autorize e copie a URL que termina em `/exec`.
5. Em `index.html`, procure `CONFIG` no final do arquivo e cole a URL em `FORM_ENDPOINT: ''`.

Sem essa URL o formulário funciona, mas só salva no navegador de quem preencheu.

## 2. Ligar o pixel do Meta Ads

1. Em Meta Business Suite, vá em **Gerenciador de Eventos → Conectar dados → Web → Pixel**.
2. Copie o ID (só os números) e cole em `META_PIXEL_ID: ''`.

Eventos já configurados:
- `PageView`
- `ViewContent` ao começar e ao terminar o diagnóstico
- `Lead` ao entrar na lista, com valor de R$ 397
- `CTA` (evento personalizado) em cada botão

## 3. Publicar

O repositório já tem outro site na raiz. Esta pasta fica publicada em `/travessia/` quando o GitHub Pages está ligado (Settings → Pages → branch `main`). Para ter um domínio próprio (por exemplo `travessia.com.br`), o melhor é mover esta pasta para um repositório só dela.

## 4. Links para anúncios

Use sempre UTM, porque ela vai para a planilha:

```
https://SEU-DOMINIO/travessia/?utm_source=meta&utm_medium=paid&utm_campaign=validacao1&utm_content=A
```
