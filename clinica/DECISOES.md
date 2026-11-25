# Clínica · decisões

Toda decisão nova entra aqui, com data e porquê. Antes de construir, a arquitetura passou por um **estrategista independente** (cujo papel é discordar) e por uma **pesquisa de mercado** (Simples Dental, Clinicorp, Codental, Clínica nas Nuvens, apps de finanças por voz).

## Decisões tomadas

| Data | Decisão | Por quê |
|---|---|---|
| nov/2026 | **PWA estático**, sem servidor, dados só no aparelho (IndexedDB) | MVP rápido e de custo zero. Sem banco de terceiros, há menos exposição de dados de saúde (LGPD). |
| nov/2026 | **Backup como função central**: arquivo criptografado com senha (AES-GCM), Web Share para o Drive, aviso na tela inicial depois de 7 dias | Dado só no celular some se o celular quebrar. O estrategista apontou que backup manual "não acontece" se não for lembrado. |
| nov/2026 | **Registros prontos para sincronizar**: UUID, `atualizadoEm` e exclusão lógica | A sincronização em nuvem (fase 2) não vai exigir migração. |
| nov/2026 | **Interpretador local é o caminho principal**; a IA é opcional, desligada por padrão, com aviso de privacidade | Ela não precisa criar conta para começar. Não há transferência de dados de saúde para o exterior sem ela saber. Funciona sem internet. |
| nov/2026 | IA com `claude-opus-5-5`, esforço baixo, saída em JSON com esquema e troca automática de modelo em caso de recusa | Lê notas e boletos com precisão. O JSON com esquema evita respostas fora do formato. |
| nov/2026 | **Ditado:** microfone do próprio app quando o navegador permite; senão, o 🎤 do teclado | O reconhecimento de voz do navegador é instável no iPhone instalado, e o ditado do teclado funciona em todo celular. |
| nov/2026 | **Retornos também na agenda do celular** (.ics no iPhone, Google Agenda no Android) | Sem servidor não há notificação push. A agenda do celular avisa no dia, com o app fechado. |
| nov/2026 | **Taxa da maquininha no cálculo do lucro**, por forma de pagamento | Estética vende muito no cartão parcelado. Sem a taxa, a margem fica inflada. |
| nov/2026 | **Mensagem de WhatsApp sem citar o procedimento** | A prévia aparece na tela bloqueada do paciente. Discrição (cartilha LGPD da SBCP). |
| nov/2026 | Retornos sugeridos: botox 4 meses, preenchimento labial 9, harmonização 5, bioestimulador 45 dias, skinbooster 30 dias, limpeza 6 meses, siso 7 dias, restauração e clareamento 6 meses, canal 30 dias | Bulas de toxina, SBCP, Manual MSD. Tudo editável em Ajustes. |
| nov/2026 | **PIN é só tela de privacidade**, e o app diz isso | Criptografar com o PIN faria um esquecimento apagar tudo. A segurança real é o bloqueio do celular. |
| nov/2026 | **Ponto de equilíbrio em número de atendimentos** ("faltam X para pagar o mês") | É mais fácil de entender do que um percentual. Pesquisa: concorrentes quase não mostram. |
| nov/2026 | "Retirada pessoal" fica **fora** do lucro | Pró-labore não é custo da clínica. Misturar esconderia se o negócio dá lucro. |
| nov/2026 | Apagar paciente **anonimiza** (nome, telefone e observação) e mantém os valores | Atende ao pedido de exclusão (LGPD) sem quebrar as contas. |

## Perguntas em aberto

1. **Endereço próprio para o app.** Hoje ele está em `freddalla.github.io/Site/clinica/`, a mesma origem do site da Rebeca e do Dipa.
   - O risco: dados do navegador são separados por origem, não por pasta. Um script de terceiros numa dessas páginas (por exemplo, o pixel da Meta do Dipa) poderia ler os dados da clínica.
   - **Recomendação:** antes de ela começar a usar de verdade, publicar o app numa origem só dele. Por exemplo, uma conta ou organização GitHub separada (`clinica-rebeca.github.io`) ou um subdomínio próprio.
   - Mudar depois exige backup e restauração, porque os dados não acompanham a troca de endereço.
2. **Carnê-leão / livro-caixa.** Se ela atende como pessoa física, o carnê-leão pede o CPF de quem pagou. Vale perguntar ao contador antes de acrescentar o campo.
3. **Fase 2:** sincronização em nuvem (por exemplo, Supabase com criptografia), lembrete automático por notificação e margem por procedimento com custo do insumo (unidades de toxina por paciente).
