/* =====================================================================
   TRAVESSIA · Biblioteca de conteúdo do painel
   Edite à vontade: cada pílula termina com um protocolo (ação específica
   e verificável) e uma pergunta. As traduções são livres, com a fonte.
   fase: clareza | corpo | coragem | direcao  (semanas 1–4 da trilha)
   pilares: corpo | mente | proposito | relacoes | coragem | presenca
   ===================================================================== */

const PILARES = {
  corpo:     { nome: 'Corpo',     desc: 'Energia, sono, movimento, saúde' },
  mente:     { nome: 'Mente',     desc: 'Foco, calma, menos ansiedade' },
  proposito: { nome: 'Propósito', desc: 'Sentido, trabalho, projeto próprio' },
  relacoes:  { nome: 'Relações',  desc: 'Vínculos, conversas reais, pertencimento' },
  coragem:   { nome: 'Coragem',   desc: 'Decisões, parar de adiar' },
  presenca:  { nome: 'Presença',  desc: 'Menos tela, silêncio, espiritualidade' }
};

const TRADICOES = {
  estoicismo: 'Estoicismo',
  budismo:    'Budismo',
  evangelhos: 'Jesus · Evangelhos',
  mitologia:  'Mitologia'
};

const FASES = {
  clareza: { nome: 'Clareza', pergunta: 'O que está me travando?' },
  corpo:   { nome: 'Corpo',   pergunta: 'Como eu volto a me mover?' },
  coragem: { nome: 'Coragem', pergunta: 'Que decisão eu estou adiando?' },
  direcao: { nome: 'Direção', pergunta: 'Qual é o meu próximo movimento?' }
};

const PILULAS = [
  /* ---------------- ESTOICISMO ---------------- */
  { id:'epicteto-controle', trad:'estoicismo', fase:'clareza', pilares:['mente','coragem'],
    titulo:'O que depende de você',
    citacao:'Algumas coisas dependem de nós; outras não.',
    ref:'Epicteto, Manual, 1',
    texto:'Epicteto foi escravizado antes de virar filósofo. Ele sabia o que era não controlar a própria vida, e mesmo assim separava com precisão o que era dele (julgamentos, escolhas, esforço) do que não era (opinião alheia, resultado, passado). Boa parte da ansiedade é energia gasta na coluna errada.',
    protocolo:'Pegue a preocupação que mais ocupou sua cabeça ontem. Numa folha, faça duas colunas: "depende de mim" e "não depende". Escolha um item da primeira coluna e faça em até 10 minutos, hoje.',
    pergunta:'O que você está tentando controlar que não depende de você?' },

  { id:'epicteto-julgamento', trad:'estoicismo', fase:'clareza', pilares:['mente'],
    titulo:'Não são as coisas',
    citacao:'O que perturba as pessoas não são as coisas, mas os julgamentos que elas fazem sobre as coisas.',
    ref:'Epicteto, Manual, 5',
    texto:'Entre o fato e a sua reação existe um julgamento rápido, quase invisível. "Ele não respondeu" vira "ele não me respeita". Os estoicos treinavam enxergar esse instante. A técnica moderna equivalente se chama reavaliação cognitiva e é uma das formas mais estudadas de regular emoção.',
    protocolo:'Hoje, na primeira irritação, descreva o fato numa frase neutra, sem adjetivos, como uma câmera descreveria. Só depois decida o que fazer.',
    pergunta:'Que história você contou para si mesmo hoje que talvez não seja o fato?' },

  { id:'seneca-brevidade', trad:'estoicismo', fase:'clareza', pilares:['presenca','proposito'],
    titulo:'A vida não é curta',
    citacao:'Não é que tenhamos pouco tempo para viver; é que desperdiçamos muito.',
    ref:'Sêneca, Sobre a brevidade da vida, 1',
    texto:'Sêneca escreveu isso há quase dois mil anos, sem celular. Ele dizia que as pessoas guardam dinheiro com cuidado e entregam o tempo a qualquer um. O tempo é o único recurso que não volta e o que mais distribuímos sem perceber.',
    protocolo:'Abra o tempo de uso do seu celular e veja o total de ontem. Escolha um app e corte 30 minutos dele hoje. Use esses 30 minutos em algo ligado ao seu sonho.',
    pergunta:'Para onde foram as suas horas livres desta semana?' },

  { id:'seneca-imaginacao', trad:'estoicismo', fase:'coragem', pilares:['coragem','mente'],
    titulo:'Sofremos mais na imaginação',
    citacao:'Sofremos mais vezes na imaginação do que na realidade.',
    ref:'Sêneca, Cartas a Lucílio, 13',
    texto:'Os estoicos praticavam a premeditatio malorum: imaginar o pior de forma deliberada, para tirar o poder do medo vago. O medo sem nome é infinito. O medo escrito tem tamanho, custo e conserto.',
    protocolo:'Escreva a decisão que você adia. Embaixo, em três listas: (1) o pior que pode acontecer, (2) o que você faria para consertar cada item, (3) o custo de não fazer nada por mais um ano. Leva 10 minutos.',
    pergunta:'Qual é o custo de continuar exatamente como está por mais um ano?' },

  { id:'seneca-exame', trad:'estoicismo', fase:'direcao', pilares:['mente','proposito'],
    titulo:'O exame da noite',
    citacao:'Examino o meu dia inteiro e repasso o que fiz e o que disse. Não escondo nada de mim.',
    ref:'Sêneca, Sobre a ira, III.36',
    texto:'Toda noite, quando a luz se apagava, Sêneca revisava o dia: o que fiz de bom, onde errei, o que posso fazer melhor. Sem culpa, como um treinador revendo o jogo. É a origem do diário reflexivo que você usa neste painel.',
    protocolo:'Antes de dormir, responda em 3 minutos: o que fiz bem hoje? Onde errei? O que faço diferente amanhã? Uma linha para cada.',
    pergunta:'Se um treinador assistisse ao seu dia de hoje, que ajuste ele sugeriria?' },

  { id:'marco-amanhecer', trad:'estoicismo', fase:'corpo', pilares:['corpo','proposito'],
    titulo:'Levanto para o trabalho de um ser humano',
    citacao:'De manhã, quando custar a levantar, tenha este pensamento à mão: levanto-me para fazer o trabalho de um ser humano.',
    ref:'Marco Aurélio, Meditações, 5.1',
    texto:'O homem mais poderoso do mundo também tinha preguiça de sair da cama, e escreveu isso no próprio diário. A manhã define o tom do dia. A luz natural nos primeiros 60 minutos ajuda a ajustar o relógio biológico, o que melhora a energia de dia e o sono à noite.',
    protocolo:'Amanhã, levante sem soneca. Em até 60 minutos depois de acordar, fique 10 minutos ao ar livre (20 se estiver nublado), sem óculos escuros e sem olhar o celular.',
    pergunta:'Para qual trabalho você se levanta? É o seu ou é o que esperam de você?' },

  { id:'marco-refugio', trad:'estoicismo', fase:'corpo', pilares:['presenca','mente'],
    titulo:'O refúgio interior',
    citacao:'As pessoas buscam retiros no campo, na praia, nas montanhas. Mas você pode, quando quiser, retirar-se para dentro de si mesmo.',
    ref:'Marco Aurélio, Meditações, 4.3',
    texto:'Marco Aurélio governava um império em guerra e não tinha férias. O retiro dele era curto e frequente: voltar para dentro por alguns instantes, várias vezes ao dia. Não precisa de viagem. Precisa de pausa.',
    protocolo:'Hoje, faça 3 pausas de 1 minuto (manhã, tarde e noite): olhos fechados, 5 respirações lentas com a expiração mais longa que a inspiração.',
    pergunta:'Onde fica o seu refúgio quando não dá para sair de onde você está?' },

  { id:'marco-obstaculo', trad:'estoicismo', fase:'coragem', pilares:['coragem','proposito'],
    titulo:'O obstáculo vira o caminho',
    citacao:'O impedimento à ação favorece a ação. O que está no caminho torna-se o caminho.',
    ref:'Marco Aurélio, Meditações, 5.20',
    texto:'Para os estoicos, todo obstáculo é material de treino. Não dava para fazer o plano A? Então pratique a paciência, a criatividade, a humildade. A pergunta muda de "por que isso comigo?" para "o que isso me obriga a desenvolver?".',
    protocolo:'Escreva o maior obstáculo da sua meta de 90 dias. Ao lado, escreva uma habilidade que ele te obriga a treinar e um primeiro passo para treiná-la esta semana.',
    pergunta:'Que obstáculo você está usando como desculpa, e não como treino?' },

  { id:'marco-cooperar', trad:'estoicismo', fase:'direcao', pilares:['relacoes'],
    titulo:'Feitos para cooperar',
    citacao:'Fomos feitos para cooperar, como os pés, as mãos, as pálpebras, como as fileiras de dentes de cima e de baixo.',
    ref:'Marco Aurélio, Meditações, 2.1',
    texto:'Marco Aurélio começava o dia avisando a si mesmo que encontraria gente difícil, ingrata e arrogante. Em vez de se blindar, lembrava que ninguém atravessa sozinho. Pessoas difíceis fazem parte do mesmo corpo.',
    protocolo:'Mande hoje uma mensagem para alguém que te ajudou e nunca ouviu um obrigado específico. Diga o que a pessoa fez e que diferença fez.',
    pergunta:'Quem faz parte da sua travessia e ainda não sabe disso?' },

  /* ---------------- BUDISMO ---------------- */
  { id:'buda-mente', trad:'budismo', fase:'clareza', pilares:['mente'],
    titulo:'A mente vem primeiro',
    citacao:'A mente precede todos os estados. Se alguém fala ou age com a mente serena, a felicidade o segue como a sombra que nunca o deixa.',
    ref:'Dhammapada, versos 1–2',
    texto:'É o primeiro verso do texto budista mais lido do mundo. A ideia não é pensamento positivo. É perceber que a qualidade da mente com que você age muda o resultado da ação, e que essa qualidade pode ser treinada como um músculo.',
    protocolo:'Escolha uma palavra para guiar o dia (calma, coragem, presença…). Escreva num papel e deixe à vista. Volte a ela cada vez que pegar o celular.',
    pergunta:'Com que estado de mente você costuma começar o dia?' },

  { id:'buda-segunda-flecha', trad:'budismo', fase:'clareza', pilares:['mente'],
    titulo:'A segunda flecha',
    citacao:'Quando alguém é atingido por uma flecha, sente dor. Então atira em si mesmo uma segunda flecha.',
    ref:'Sallatha Sutta, Samyutta Nikaya 36.6',
    texto:'A primeira flecha é o que aconteceu: a perda, a crítica, o atraso. A segunda é o que fazemos com isso: ruminar, se culpar, prever catástrofes. A primeira nem sempre dá para evitar. A segunda é opcional.',
    protocolo:'Hoje, quando algo der errado, pare e pergunte em voz baixa: "Qual é a segunda flecha que eu estou atirando agora?". Anote no diário à noite.',
    pergunta:'Qual dor antiga você continua reabrindo com a segunda flecha?' },

  { id:'buda-jangada', trad:'budismo', fase:'coragem', pilares:['proposito','coragem'],
    titulo:'A jangada',
    citacao:'A jangada serve para atravessar, não para ser carregada nas costas.',
    ref:'Alagaddupama Sutta, Majjhima Nikaya 22',
    texto:'Um viajante constrói uma jangada para cruzar um rio. Do outro lado, agradecido, decide carregá-la nas costas pelo resto da viagem. O Buda pergunta: isso é sábio? Crenças, hábitos e papéis que te trouxeram até aqui podem ser exatamente o peso que te impede de seguir.',
    protocolo:'Liste 3 coisas (um hábito, uma crença, um papel) que te ajudaram no passado e hoje pesam. Escolha uma e decida o que fazer com ela esta semana: largar, reduzir ou trocar.',
    pergunta:'Que jangada você continua carregando por gratidão ou por medo?' },

  { id:'buda-flecha-envenenada', trad:'budismo', fase:'coragem', pilares:['coragem'],
    titulo:'A flecha envenenada',
    citacao:'É como um homem atingido por uma flecha envenenada que não deixa o médico tirá-la antes de saber quem a atirou.',
    ref:'Cula-Malunkyovada Sutta, Majjhima Nikaya 63',
    texto:'Um discípulo se recusava a praticar até o Buda responder todas as grandes questões do universo. O Buda respondeu com essa parábola: o homem morreria antes de ter as respostas. Muitas perguntas que fazemos antes de agir são, na verdade, formas sofisticadas de adiar.',
    protocolo:'Escreva a pergunta que você usa para não começar ("e se não der certo?", "qual o momento ideal?"). Troque por uma ação de 5 minutos e faça agora.',
    pergunta:'Que pergunta você precisa parar de fazer para começar?' },

  { id:'buda-kalama', trad:'budismo', fase:'clareza', pilares:['proposito'],
    titulo:'Teste por si mesmo',
    citacao:'Não aceitem algo só por tradição, por ouvir dizer ou porque o mestre disse. Quando souberem por si mesmos que algo leva ao bem, então adotem.',
    ref:'Kalama Sutta, Anguttara Nikaya 3.65',
    texto:'É um dos textos mais livres da história das religiões: o próprio Buda pede para não acreditarem nele sem testar. Vale para o roteiro que a sociedade entrega (estudar, cadeira de escritório, casar, repetir). Pode ser o seu caminho. Mas só se você testar e escolher.',
    protocolo:'Escreva 3 "regras de vida" que você segue. Ao lado de cada uma: "escolhi" ou "herdei". Para uma herdada, escreva o que faria se ela não existisse.',
    pergunta:'Que parte da sua vida é sua verdade e que parte é expectativa dos outros?' },

  { id:'buda-vencer', trad:'budismo', fase:'corpo', pilares:['corpo','coragem'],
    titulo:'Vencer a si mesmo',
    citacao:'Maior que vencer mil vezes mil homens em batalha é vencer a si mesmo.',
    ref:'Dhammapada, verso 103',
    texto:'Fazer uma coisa difícil e voluntária logo cedo cria uma prova concreta, para você mesmo, de que consegue escolher o desconforto. O frio é um exemplo clássico: ele aumenta o estado de alerta por horas e treina a mente a não obedecer ao primeiro impulso de fugir.',
    protocolo:'Termine o banho com 1 a 3 minutos de água fria, respirando devagar pelo nariz. Se tiver alguma condição cardíaca, troque por fazer primeiro a tarefa que você mais evita.',
    pergunta:'Em que batalha consigo mesmo você mais perde?' },

  { id:'buda-respiracao', trad:'budismo', fase:'corpo', pilares:['presenca','mente'],
    titulo:'Inspirando longo, ele sabe',
    citacao:'Inspirando longo, ele sabe: "inspiro longo". Expirando curto, ele sabe: "expiro curto".',
    ref:'Anapanasati Sutta, Majjhima Nikaya 118',
    texto:'A instrução original de meditação é quase técnica: só perceber a respiração como ela é. A respiração é a única função automática do corpo que também dá para controlar, e por isso é a porta mais rápida entre o corpo e a mente.',
    protocolo:'Faça a meditação de hoje contando as expirações de 1 a 10. Se perder a conta, volte ao 1 sem bronca. O exercício é voltar.',
    pergunta:'Quantas vezes por dia você percebe que está respirando?' },

  { id:'buda-irrigador', trad:'budismo', fase:'direcao', pilares:['proposito','corpo'],
    titulo:'Moldar a si mesmo',
    citacao:'Os irrigadores conduzem a água, os flecheiros endireitam a flecha, os carpinteiros moldam a madeira. Os sábios moldam a si mesmos.',
    ref:'Dhammapada, verso 80',
    texto:'Ninguém endireita uma flecha de uma vez: é um ajuste pequeno, repetido. A ciência dos hábitos diz o mesmo. Ações minúsculas presas a algo que você já faz têm mais chance de durar do que grandes resoluções.',
    protocolo:'Crie um hábito de 2 minutos com a fórmula "depois de [algo que já faço], eu [nova ação]". Exemplo: "depois de passar o café, escrevo uma linha do meu projeto". Faça hoje.',
    pergunta:'Que hábito minúsculo, feito por um ano, mudaria a sua vida?' },

  { id:'buda-metta', trad:'budismo', fase:'direcao', pilares:['relacoes','presenca'],
    titulo:'O coração sem limites',
    citacao:'Como uma mãe protege com a vida o seu único filho, assim, com o coração sem limites, cultive o bem-querer por todos os seres.',
    ref:'Karaniya Metta Sutta, Sutta Nipata 1.8',
    texto:'Metta é a prática de desejar o bem de forma deliberada: a si, a quem você ama, a um desconhecido e, por fim, a alguém difícil. Não é sentimento forçado. É treinar a direção da atenção.',
    protocolo:'Por 3 minutos, repita em silêncio "que você esteja bem, que você esteja em paz" pensando em: você, alguém que ama, um desconhecido que viu hoje, alguém difícil.',
    pergunta:'Com quem você está em guerra silenciosa, e o que isso tem te custado?' },

  /* ---------------- JESUS · EVANGELHOS ---------------- */
  { id:'jesus-outra-margem', trad:'evangelhos', fase:'coragem', pilares:['coragem'],
    titulo:'Passemos para a outra margem',
    citacao:'Passemos para a outra margem.',
    ref:'Marcos 4:35–40',
    texto:'Jesus chama os discípulos para a travessia. No meio do lago vem a tempestade, e eles entram em pânico. A pergunta dele depois é direta: "Por que tanto medo?". A travessia não promete mar calmo. Promete a outra margem.',
    protocolo:'Escreva numa frase qual é a sua "outra margem": o lugar, a vida ou a decisão do outro lado. Cole onde você vê todo dia.',
    pergunta:'Qual tempestade você está usando como motivo para voltar à margem de antes?' },

  { id:'jesus-amanha', trad:'evangelhos', fase:'clareza', pilares:['mente'],
    titulo:'Basta a cada dia',
    citacao:'Não vos preocupeis com o dia de amanhã, pois o amanhã trará as suas próprias preocupações. Basta a cada dia o seu próprio mal.',
    ref:'Mateus 6:34',
    texto:'Não é um convite à irresponsabilidade. É um corte de escopo: o que dá para fazer hoje cabe no hoje, o resto é ruído. Ansiedade costuma ser a mente tentando resolver amanhã um problema que só existe amanhã.',
    protocolo:'Escreva suas 3 maiores preocupações. Para cada uma, responda: "o que dela é de hoje?". Faça só essa parte. Risque o resto.',
    pergunta:'Que preocupação de amanhã está roubando o seu hoje?' },

  { id:'jesus-lirios', trad:'evangelhos', fase:'corpo', pilares:['presenca'],
    titulo:'Olhai os lírios do campo',
    citacao:'Olhai os lírios do campo, como crescem: não trabalham nem fiam.',
    ref:'Mateus 6:28',
    texto:'Jesus ensinava ao ar livre, apontando para pássaros, sementes, campos. Contemplar a natureza não é fuga. É lembrar que você faz parte de algo maior e mais lento do que a sua caixa de entrada.',
    protocolo:'Passe 10 minutos ao ar livre observando algo vivo (uma árvore, o mar, pássaros), sem celular e sem fone. Repare em 3 detalhes que você nunca tinha notado.',
    pergunta:'O que a natureza faz sem pressa que você tenta forçar?' },

  { id:'jesus-talentos', trad:'evangelhos', fase:'direcao', pilares:['proposito','coragem'],
    titulo:'O talento enterrado',
    citacao:'Tive medo, e escondi o teu talento na terra.',
    ref:'Mateus 25:14–30',
    texto:'Na parábola, dois servos fazem os talentos renderem. O terceiro, por medo, enterra o seu e devolve intacto. É o único criticado. Não por perder, mas por não tentar. Talento guardado por medo não fica seguro. Fica parado.',
    protocolo:'Escolha um talento seu que está enterrado (escrever, fotografar, ensinar, construir). Dedique 20 minutos a ele hoje. Cronometre.',
    pergunta:'Que talento seu está enterrado por medo de dar errado?' },

  { id:'jesus-lampada', trad:'evangelhos', fase:'direcao', pilares:['proposito','coragem'],
    titulo:'A lâmpada debaixo do cesto',
    citacao:'Ninguém acende uma lâmpada para colocá-la debaixo de um cesto, mas no candelabro, e ela ilumina a todos que estão na casa.',
    ref:'Mateus 5:15',
    texto:'Muita gente tem ideias, projetos e trabalhos bons escondidos por vergonha ou perfeccionismo. Mostrar não é vaidade. É deixar a luz fazer o que ela foi feita para fazer.',
    protocolo:'Mostre hoje algo que você fez (uma foto, um texto, uma ideia) para pelo menos uma pessoa e peça uma opinião sincera.',
    pergunta:'O que você está escondendo esperando ficar perfeito?' },

  { id:'jesus-deserto', trad:'evangelhos', fase:'corpo', pilares:['presenca'],
    titulo:'Um lugar à parte',
    citacao:'De madrugada, ainda escuro, ele se levantou, saiu e foi para um lugar deserto, e ali orava.',
    ref:'Marcos 1:35; 6:31',
    texto:'Mesmo cercado de multidões, Jesus se retirava antes de todos acordarem. E chamava os discípulos: "vinde à parte e descansai um pouco". Silêncio não é ausência de vida. É onde você escuta o que o barulho cobre.',
    protocolo:'Amanhã, a primeira hora depois de acordar é sem celular: sem notícia, sem WhatsApp, sem rede. Deixe o aparelho em outro cômodo na noite anterior.',
    pergunta:'Quando foi a última vez que você ficou realmente sozinho em silêncio?' },

  { id:'jesus-pedro', trad:'evangelhos', fase:'coragem', pilares:['coragem','mente'],
    titulo:'Pedro sobre as águas',
    citacao:'Mas, reparando na força do vento, teve medo; e, começando a afundar, gritou.',
    ref:'Mateus 14:29–31',
    texto:'Pedro andou sobre a água enquanto olhava para frente. Afundou quando passou a olhar o vento. A cena serve para o foco: quando a atenção se espalha pelas ameaças, o passo afunda.',
    protocolo:'Escolha uma única tarefa importante. Faça um bloco de 90 minutos nela com o celular em outro cômodo e as notificações do computador desligadas.',
    pergunta:'Qual é o vento que tira o seu olhar do que importa?' },

  { id:'jesus-verdade', trad:'evangelhos', fase:'coragem', pilares:['relacoes','coragem'],
    titulo:'A verdade liberta',
    citacao:'Conhecereis a verdade, e a verdade vos libertará.',
    ref:'João 8:32',
    texto:'Quase toda prisão pessoal tem uma verdade não dita no centro: para alguém, ou para si mesmo. Dizer custa um momento de desconforto. Não dizer custa anos.',
    protocolo:'Escreva uma verdade sua que nunca disse em voz alta. Decida se hoje ela vai para uma conversa ou fica no papel. As duas opções valem.',
    pergunta:'Que verdade você está evitando dizer, e para quem?' },

  { id:'jesus-samaritano', trad:'evangelhos', fase:'direcao', pilares:['relacoes'],
    titulo:'Quem é o meu próximo?',
    citacao:'Qual destes três te parece ter sido o próximo daquele que caiu nas mãos dos assaltantes? O que usou de misericórdia para com ele.',
    ref:'Lucas 10:25–37',
    texto:'Um sacerdote e um levita passam reto pelo homem ferido. Quem para é um samaritano, o estrangeiro malvisto. Jesus inverte a pergunta: não é "quem merece minha ajuda?", e sim "de quem eu escolho me aproximar?".',
    protocolo:'Hoje, pare de verdade para alguém: pergunte "como você está de verdade?" e escute por 5 minutos sem dar conselho.',
    pergunta:'Por quem você tem passado reto?' },

  /* ---------------- MITOLOGIA ---------------- */
  { id:'mito-sisifo', trad:'mitologia', fase:'clareza', pilares:['proposito','presenca'],
    titulo:'Sísifo e a pedra',
    citacao:'É preciso imaginar Sísifo feliz.',
    ref:'Mitologia grega · Albert Camus, O mito de Sísifo',
    texto:'Sísifo foi condenado a empurrar uma pedra morro acima para sempre. Quando chegava perto do topo, ela rolava de volta. Camus via nele o retrato da vida moderna: a mesma rotina, todo dia. O primeiro passo da travessia é enxergar a pedra.',
    protocolo:'Liste 3 coisas que você repete toda semana sem ter escolhido. Elimine, reduza ou delegue uma delas até domingo.',
    pergunta:'Qual é a sua pedra?' },

  { id:'mito-icaro', trad:'mitologia', fase:'coragem', pilares:['coragem','proposito'],
    titulo:'Não voe baixo demais',
    citacao:'Voe pelo meio: se for baixo demais, a água pesará as asas; se for alto demais, o fogo as queimará.',
    ref:'Ovídio, Metamorfoses, VIII',
    texto:'Todo mundo lembra que Ícaro caiu por voar alto demais. Quase ninguém lembra que Dédalo também avisou: baixo demais, o mar pesa as asas e você afunda. A sociedade conta só metade do mito. Conformismo também derruba.',
    protocolo:'Pegue a sua meta de 90 dias e escreva uma versão 10% mais ousada. Decida qual das duas você vai perseguir de verdade.',
    pergunta:'Em que área da vida você está voando baixo demais?' },

  { id:'mito-ulisses', trad:'mitologia', fase:'corpo', pilares:['mente','corpo'],
    titulo:'Amarrado ao mastro',
    citacao:'Amarrem-me ao mastro, de pé, e se eu pedir para soltar, apertem ainda mais.',
    ref:'Homero, Odisseia, canto XII',
    texto:'Ulisses sabia que não resistiria ao canto das sereias, então decidiu antes. Mandou se amarrar e tampou com cera o ouvido dos remadores. Hoje chamamos isso de pré-compromisso: força de vontade falha, ambiente bem desenhado não.',
    protocolo:'Crie uma amarra hoje: tire as redes sociais da tela inicial, deixe a roupa de treino pronta na porta ou marque o treino com alguém.',
    pergunta:'Qual é a sua sereia, e qual mastro você pode construir?' },

  { id:'mito-ariadne', trad:'mitologia', fase:'direcao', pilares:['proposito'],
    titulo:'O fio de Ariadne',
    citacao:'Com o fio na mão, Teseu entrou no labirinto e encontrou o caminho de volta.',
    ref:'Mitologia grega · Teseu e o Minotauro',
    texto:'O labirinto era impossível de mapear de uma vez. Teseu não precisou de mapa. Precisou de um fio e de seguir um passo de cada vez. Metas grandes paralisam. O próximo passo, pequeno e claro, liberta.',
    protocolo:'Escreva o próximo passo da sua meta, pequeno o bastante para fazer em 5 minutos. Faça agora, antes de fechar o painel.',
    pergunta:'Qual é o próximo pedaço do fio?' },

  { id:'mito-kairos', trad:'mitologia', fase:'direcao', pilares:['presenca','coragem'],
    titulo:'Kairós e Cronos',
    citacao:'Kairós tinha cabelo na testa e a nuca careca: dava para agarrá-lo de frente, nunca depois que passava.',
    ref:'Mitologia grega · estátua de Lisipo',
    texto:'Os gregos tinham dois deuses do tempo. Cronos é o relógio, que conta e consome. Kairós é o momento certo, a oportunidade que aparece e some. Quem vive só em Cronos vê os dias passarem. Quem presta atenção encontra Kairós.',
    protocolo:'Hoje, diga sim para um convite, uma conversa ou uma ideia que você normalmente deixaria para depois.',
    pergunta:'Que oportunidade passou por você recentemente e você deixou ir?' },

  { id:'mito-narciso', trad:'mitologia', fase:'corpo', pilares:['presenca'],
    titulo:'Narciso e a tela',
    citacao:'Preso à própria imagem refletida na água, Narciso definhou à beira da fonte.',
    ref:'Ovídio, Metamorfoses, III',
    texto:'Narciso não morreu de vaidade. Morreu de não conseguir parar de olhar. A tela é o espelho d’água de hoje: feita para prender o olhar. Cores vivas e notificações vermelhas não estão lá por acaso.',
    protocolo:'Coloque o celular em escala de cinza (nas configurações de acessibilidade) por 24 horas. Repare quantas vezes você o pega sem motivo.',
    pergunta:'O que você perde enquanto olha para o espelho d’água?' },

  { id:'mito-heracles', trad:'mitologia', fase:'corpo', pilares:['corpo','coragem'],
    titulo:'Héracles na encruzilhada',
    citacao:'Duas mulheres apareceram a Héracles: uma oferecia o caminho fácil e prazeroso; a outra, o caminho árduo que leva ao que vale a pena.',
    ref:'Xenofonte, Memoráveis, II.1 (a escolha de Héracles, de Pródico)',
    texto:'Antes dos doze trabalhos, Héracles teve que escolher entre dois caminhos. A escolha grande é feita de escolhas pequenas: escada ou elevador, rolar o feed ou ler, mais um episódio ou dormir.',
    protocolo:'Hoje, em 3 escolhas pequenas, escolha o caminho árduo de propósito. Ex.: escada, 10 minutos de caminhada depois do almoço, dormir no horário.',
    pergunta:'Qual encruzilhada pequena você atravessa todo dia sem perceber?' },

  { id:'mito-baucis', trad:'mitologia', fase:'direcao', pilares:['relacoes'],
    titulo:'Báucis e Filêmon',
    citacao:'Os deuses bateram em mil portas. Só um casal de velhos pobres abriu a sua.',
    ref:'Ovídio, Metamorfoses, VIII',
    texto:'Zeus e Hermes andaram disfarçados de viajantes. Todos os ricos fecharam a porta. Báucis e Filêmon dividiram o pouco que tinham. A recompensa que pediram foi envelhecer juntos. Hospitalidade é uma forma antiga de riqueza.',
    protocolo:'Convide alguém para um café, uma caminhada ou um almoço nesta semana. Mande o convite hoje.',
    pergunta:'Para quem você poderia abrir a porta esta semana?' },

  { id:'mito-penelope', trad:'mitologia', fase:'clareza', pilares:['proposito','coragem'],
    titulo:'A teia de Penélope',
    citacao:'De dia ela tecia a grande teia; de noite, à luz de tochas, a desfazia.',
    ref:'Homero, Odisseia, canto II',
    texto:'Penélope desfazia o trabalho de propósito, por estratégia, para ganhar tempo. Muita gente faz o mesmo sem perceber: começa, desfaz, recomeça. A diferença é que ela sabia o motivo.',
    protocolo:'Termine hoje uma coisa que está começada há tempo: um e-mail, um conserto, um texto, uma conversa. Só uma.',
    pergunta:'O que você vive começando e desfazendo, e qual é o verdadeiro motivo?' }
];

/* Perguntas de autoconhecimento para o diário (rodam junto com a da pílula) */
const PERGUNTAS = {
  geral: [
    'O que você fazia quando criança que te fazia perder a noção do tempo?',
    'Se ninguém fosse julgar, o que você faria da vida?',
    'O que você sabe que precisa fazer, mas continua negociando?',
    'Qual parte do seu dia te dá mais energia? E qual te drena?',
    'Do que você vai se arrepender se nada mudar em 5 anos?',
    'Qual conselho você daria para você de 5 anos atrás?',
    'O que te indigna no mundo a ponto de querer fazer algo?',
    'Qual momento de hoje você gostaria de repetir?'
  ],
  corpo: ['Como o seu corpo estava hoje: pesado, leve, tenso, cansado?', 'O que o seu corpo está pedindo que você ignora?', 'Como foi o seu sono nas últimas 3 noites, e o que o atrapalha?'],
  mente: ['O que ocupou mais espaço na sua cabeça hoje?', 'Que pensamento repetido você poderia escrever e deixar no papel?', 'Em que momento de hoje você esteve mais presente?'],
  proposito: ['Que trabalho você faria mesmo sem receber?', 'O que você quer que digam de você aos 80 anos?', 'Qual pequena parte do seu sonho já dá para viver agora?'],
  relacoes: ['Com quem você se sente mais você mesmo?', 'Qual conversa difícil está pendente?', 'Quem você gostaria de ter mais perto?'],
  coragem: ['Que decisão você está adiando, e desde quando?', 'O que você faria se tivesse 10% mais coragem?', 'Qual medo, se escrito, perderia metade da força?'],
  presenca: ['Quanto tempo você passou em telas hoje sem ter escolhido?', 'Qual foi o momento mais silencioso do seu dia?', 'O que você viu hoje que quase passou batido?']
};

/* Ângulos que mudam a cada dia para a gratidão não virar tarefa repetida */
const GRATIDAO_ANGULOS = [
  ['Uma pessoa', 'Algo no seu corpo', 'Um detalhe pequeno'],
  ['Algo difícil que ensinou', 'Um lugar', 'Algo que você fez'],
  ['Uma conversa', 'Algo que um dia você desejou e hoje tem', 'Algo simples'],
  ['Um momento de calma', 'Alguém que te ajudou', 'Algo que funcionou'],
  ['Uma sensação', 'Algo da natureza', 'Uma escolha sua'],
  ['Algo que te fez rir', 'Uma comida ou bebida', 'Um aprendizado'],
  ['Um encontro', 'Algo que você não precisou fazer', 'O próprio dia']
];

/* Ações diárias sugeridas por pilar (a pessoa edita no Rumo) */
const ACOES_SUGERIDAS = {
  corpo: ['10 min de luz natural ao acordar', 'Caminhar 20 minutos', 'Dormir no mesmo horário', '2 litros de água'],
  mente: ['Bloco de 90 min de foco sem celular', 'Escrever 3 tarefas do dia antes de abrir o e-mail', 'Ler 10 páginas'],
  proposito: ['30 min no meu projeto', 'Uma linha de ideia por dia', 'Estudar 20 min algo que me interessa'],
  relacoes: ['Uma mensagem sincera para alguém', 'Jantar sem celular', 'Ligar em vez de mandar texto'],
  coragem: ['Fazer primeiro a tarefa que mais evito', 'Um "sim" para algo novo', 'Uma conversa adiada'],
  presenca: ['Primeira hora sem celular', 'Caminhar sem fone', 'Celular fora do quarto à noite']
};

/* Meditações de 5 minutos. cues: [segundo, texto]. respiracao: fases em loop */
const MEDITACOES = {
  suspiro: { nome:'Suspiro cíclico', origem:'Estudo de Stanford (Balban et al., 2023)',
    desc:'Duas inspirações pelo nariz e uma expiração longa pela boca. Em um estudo de 1 mês, 5 min por dia disso melhoraram mais o humor do que meditação mindfulness.',
    respiracao:[['Inspire pelo nariz',2.5,1],['Mais um pouco',1,1.15],['Solte devagar pela boca',6,.55]],
    cues:[[0,'Sente-se confortável. Siga o círculo.'],[60,'Deixe a expiração ser sempre a parte mais longa.'],[150,'Se a mente fugir, volte para o som do ar saindo.'],[240,'Último minuto. Repare em como o corpo está agora.']] },
  contagem: { nome:'Respiração contada', origem:'Anapanasati · tradição budista',
    desc:'Respire normalmente e conte as expirações de 1 a 10. Perdeu a conta? Volte ao 1.',
    respiracao:null,
    cues:[[0,'Olhos fechados. Respire no seu ritmo.'],[20,'Conte cada expiração: um… dois… até dez.'],[120,'Perdeu a conta? Sem bronca. Volte ao um.'],[210,'O exercício não é chegar a dez. É voltar.'],[270,'Solte a contagem. Só respire.']] },
  caixa: { nome:'Respiração quadrada', origem:'Usada por militares e atletas para foco',
    desc:'Inspire 4, segure 4, expire 4, segure 4. Boa antes de uma tarefa que pede foco.',
    respiracao:[['Inspire',4,1],['Segure',4,1],['Expire',4,.55],['Segure',4,.55]],
    cues:[[0,'Siga o círculo: quatro tempos em cada lado.'],[150,'Mantenha o ombro solto.'],[255,'Último ciclo. Pense na tarefa que vem a seguir.']] },
  corpo: { nome:'Varredura do corpo', origem:'Prática contemplativa clássica',
    desc:'A atenção passeia pelo corpo, do topo da cabeça aos pés, sem tentar mudar nada.',
    respiracao:null,
    cues:[[0,'Feche os olhos. Três respirações lentas.'],[25,'Topo da cabeça, testa, olhos. Só perceba.'],[60,'Mandíbula. Deixe os dentes se separarem.'],[90,'Ombros e pescoço. Onde há tensão?'],[125,'Peito e respiração. Sinta subir e descer.'],[160,'Barriga. Deixe solta.'],[195,'Quadril e pernas. O peso no assento.'],[230,'Pés. O contato com o chão.'],[265,'O corpo inteiro, de uma vez. Respire.']] },
  visao: { nome:'Visão de cima', origem:'Marco Aurélio, Meditações 9.30',
    desc:'Uma visualização estoica: você se afasta aos poucos até ver a própria vida de longe.',
    respiracao:null,
    cues:[[0,'Feche os olhos. Veja-se sentado onde está.'],[40,'Suba. Veja o cômodo, a casa, a rua.'],[90,'Mais alto. A cidade inteira, milhares de vidas ao mesmo tempo.'],[140,'O país. O planeta. Pequeno e azul.'],[190,'Daqui, olhe para o problema que te preocupa. Qual é o tamanho dele?'],[240,'Volte devagar. Rua, casa, cômodo, corpo.'],[285,'Abra os olhos.']] },
  noite: { nome:'Exame da noite', origem:'Sêneca, Sobre a ira III.36',
    desc:'Uma revisão serena do dia. Melhor à noite, antes de dormir.',
    respiracao:null,
    cues:[[0,'Respire fundo três vezes. O dia acabou.'],[30,'Repasse o dia desde que acordou, como um filme.'],[100,'O que você fez bem hoje? Fique um pouco nisso.'],[160,'Onde errou? Sem culpa. Só veja.'],[220,'O que faria diferente amanhã? Escolha uma coisa.'],[275,'Solte o dia. Ele já foi.']] },
  silencio: { nome:'Silêncio', origem:'"Vinde à parte" · Marcos 6:31',
    desc:'Sem instruções. Um sino no começo e outro no fim.',
    respiracao:null,
    cues:[[0,'Só esteja aqui.']] }
};

/* Plano semanal sugerido (0 = domingo). A pessoa edita no Rumo. */
const PLANO_MEDITACAO = { 0:'silencio', 1:'suspiro', 2:'contagem', 3:'caixa', 4:'corpo', 5:'suspiro', 6:'visao' };

/* Sugestões de meta de 90 dias por pilar (WOOP) */
const WOOP_SUGESTOES = {
  corpo:     { desejo:'Ter energia para o dia inteiro e treinar 3x por semana', obstaculo:'Chego cansado e deixo para amanhã', plano:'Se eu chegar cansado, então coloco a roupa e faço só 10 minutos' },
  mente:     { desejo:'Ter menos ansiedade e mais foco no que importa', obstaculo:'Pego o celular sempre que fico desconfortável', plano:'Se eu sentir vontade de pegar o celular, então faço 3 respirações antes' },
  proposito: { desejo:'Tirar do papel o meu projeto próprio', obstaculo:'Acho que ainda não está bom o suficiente', plano:'Se eu travar no perfeccionismo, então publico a versão de hoje e melhoro amanhã' },
  relacoes:  { desejo:'Ter conversas mais verdadeiras com quem eu amo', obstaculo:'Evito assuntos difíceis para não criar clima', plano:'Se eu perceber que estou evitando, então digo "posso te falar uma coisa?"' },
  coragem:   { desejo:'Tomar a decisão que venho adiando', obstaculo:'Espero o momento perfeito', plano:'Se eu pensar "depois", então marco uma data no calendário na hora' },
  presenca:  { desejo:'Usar menos tela e viver mais o que está na minha frente', obstaculo:'Abro as redes no automático', plano:'Se eu abrir uma rede sem querer, então fecho e saio para caminhar 5 minutos' }
};

/* =====================================================================
   v2 · CHECK-IN DIÁRIO → PÍLULA E MANTRA DO DIA
   A pessoa diz como chega no dia; o painel escolhe a pílula que mais
   conversa com isso. Troque o nome da marca aqui quando decidir.
   ===================================================================== */
const MARCA = { nome: 'Travessia', produto: 'Diário de Bordo' };

const ESTADOS = {
  ansioso:        'Ansioso',
  cansado:        'Sem energia',
  travado:        'Travado, adiando',
  perdido:        'Sem rumo',
  medo:           'Com medo de decidir',
  irritado:       'Irritado',
  sobrecarregado: 'Sobrecarregado',
  sozinho:        'Sozinho',
  disperso:       'Disperso, muita tela',
  bem:            'Bem, quero ir além'
};

/* Palavras do texto livre que puxam um estado (busca por pedaço de palavra, sem acento) */
const LEXICO = {
  ansioso:        ['ansie','ansio','preocup','nervos','angust','aflit','inquiet'],
  cansado:        ['cansa','exaust','esgot','sem energia','desanim','sono','dormi mal'],
  travado:        ['procrastin','adiand','adio','travad','parado','preguic','nao consigo comecar'],
  perdido:        ['perdid','sem rumo','sentido','proposito','nao sei o que','vazio'],
  medo:           ['medo','receio','insegur','decisao','decidir','arrisc'],
  irritado:       ['raiva','irrit','brig','odio','injust','chatead','discut'],
  sobrecarregado: ['muita coisa','sobrecarreg','prazo','correria','trabalho demais','pressao','atrasad'],
  sozinho:        ['sozinh','solid','isolad','ninguem','saudade','abandon'],
  disperso:       ['celular','tela','instagram','redes','distra','foco','disperso','scroll'],
  bem:            ['grato','feliz','animad','otimo','bem demais','realizad','em paz']
};

/* Prática de 5 minutos recomendada para cada estado */
const MED_POR_ESTADO = {
  ansioso:'suspiro', medo:'suspiro', sobrecarregado:'visao', perdido:'visao', irritado:'contagem',
  cansado:'caixa', travado:'caixa', disperso:'contagem', sozinho:'metta', bem:'silencio'
};

MEDITACOES.metta = { nome:'Bem-querer', origem:'Metta · Karaniya Metta Sutta',
  desc:'Desejar o bem de forma deliberada: a você, a quem ama, a um desconhecido e a alguém difícil.',
  respiracao:null,
  cues:[[0,'Respire com calma. Pense em você mesmo.'],[20,'Repita por dentro: que eu esteja bem, que eu esteja em paz.'],[85,'Agora alguém que você ama. Que você esteja bem.'],[150,'Um desconhecido que você viu hoje. Que você esteja bem.'],[215,'Alguém difícil. Só o quanto conseguir. Que você esteja bem.'],[270,'Todos os seres, ao mesmo tempo. Que estejamos bem.']] };

/* Mantra e estados de cada pílula */
const EXTRAS = {
  'epicteto-controle':      ['Faço a minha parte. Solto o resto.', ['ansioso','sobrecarregado']],
  'epicteto-julgamento':    ['O fato é um. A história é minha.', ['irritado','ansioso']],
  'seneca-brevidade':       ['Meu tempo é a minha vida.', ['disperso','perdido']],
  'seneca-imaginacao':      ['O medo escrito tem tamanho.', ['medo','ansioso']],
  'seneca-exame':           ['Hoje eu revejo. Amanhã eu ajusto.', ['perdido','bem']],
  'marco-amanhecer':        ['Levanto para o meu trabalho.', ['cansado','perdido']],
  'marco-refugio':          ['Meu refúgio está a uma respiração.', ['sobrecarregado','ansioso']],
  'marco-obstaculo':        ['O obstáculo é o caminho.', ['travado','medo']],
  'marco-cooperar':         ['Ninguém atravessa sozinho.', ['sozinho','irritado']],
  'buda-mente':             ['Minha mente vem primeiro.', ['disperso','bem']],
  'buda-segunda-flecha':    ['Não atiro a segunda flecha.', ['irritado','ansioso']],
  'buda-jangada':           ['A jangada fica na margem.', ['perdido','travado']],
  'buda-flecha-envenenada': ['Primeiro eu tiro a flecha.', ['travado','medo']],
  'buda-kalama':            ['Eu testo. Depois acredito.', ['perdido']],
  'buda-vencer':            ['Venço a mim primeiro.', ['cansado','travado']],
  'buda-respiracao':        ['Inspiro, eu sei. Expiro, eu sei.', ['ansioso','disperso']],
  'buda-irrigador':         ['Eu me moldo um pouco por dia.', ['bem','travado']],
  'buda-metta':             ['Que eu esteja bem. Que você esteja bem.', ['sozinho','irritado']],
  'jesus-outra-margem':     ['Eu passo para a outra margem.', ['medo','perdido']],
  'jesus-amanha':           ['Hoje basta.', ['ansioso','sobrecarregado']],
  'jesus-lirios':           ['Os lírios não têm pressa.', ['sobrecarregado','cansado','disperso']],
  'jesus-talentos':         ['Meu talento não fica enterrado.', ['travado','medo','bem']],
  'jesus-lampada':          ['Minha luz não fica escondida.', ['medo','bem']],
  'jesus-deserto':          ['No silêncio eu escuto.', ['disperso','sobrecarregado']],
  'jesus-pedro':            ['Olho para frente, não para o vento.', ['disperso','medo']],
  'jesus-verdade':          ['A verdade me liberta.', ['medo','sozinho']],
  'jesus-samaritano':       ['Eu paro para quem está no caminho.', ['sozinho','bem']],
  'mito-sisifo':            ['Eu largo a pedra.', ['perdido','cansado']],
  'mito-icaro':             ['Não voo baixo demais.', ['travado','bem']],
  'mito-ulisses':           ['Eu me amarro ao que importa.', ['disperso']],
  'mito-ariadne':           ['Só o próximo pedaço do fio.', ['perdido','sobrecarregado']],
  'mito-kairos':            ['Agora é o momento.', ['bem','travado']],
  'mito-narciso':           ['Olho para a vida, não para o espelho.', ['disperso']],
  'mito-heracles':          ['Escolho o caminho árduo.', ['cansado','travado']],
  'mito-baucis':            ['Eu abro a porta.', ['sozinho']],
  'mito-penelope':          ['Termino o que comecei.', ['travado']]
};
PILULAS.forEach(p => { const x = EXTRAS[p.id]; if (x){ p.mantra = x[0]; p.estados = x[1]; } });
