/**
 * Textos e regras da Rosi, a assistente de pré-atendimento.
 *
 * COMO EDITAR:
 * - Falas e rótulos dos botões: edite os textos abaixo. Os nomes entre chaves ({nome}) são
 *   preenchidos automaticamente pelo site: não os apague.
 * - Sinônimos (o que o visitante pode digitar): edite as listas em `synonyms`.
 *   Escreva sem acento e em minúsculas; o site normaliza o texto digitado antes de comparar.
 * - Para incluir uma pergunta frequente, adicione um item em `faqTopics` e a resposta em `faqAnswers`.
 * - Depois de editar, rode `pnpm test` e `pnpm test:e2e`.
 * - Nunca coloque preço, prazo ou disponibilidade aqui: isso é sempre confirmado pela equipe.
 */

export const texts = {
  welcome: [
    'Oi! Eu sou a Rosi, assistente da Rosimaq 👷‍♀️',
    'Posso te ajudar a escolher o equipamento e já deixar seu pedido pronto para o WhatsApp. Como posso ajudar?',
  ],
  closedNotice:
    'Agora estamos fechados, mas pode deixar seu pedido pronto. Respondemos a partir das 7h.',
  askName: 'Como posso te chamar? (se preferir, pode pular)',
  askCity: 'Em qual cidade fica a obra?',
  cityOutside:
    'Essa cidade não está na nossa lista principal, mas a equipe pode verificar para você. Vou incluir no pedido.',
  askTask: 'Sem problema! O que você vai fazer na obra?',
  askCategory: 'Que tipo de equipamento você procura?',
  pickEquipment: 'Escolha o equipamento:',
  recommended: 'Para isso, recomendo:',
  askQuantity: 'Quantas unidades de {equipamento}?',
  askQuantityCustom: 'Quantas unidades? Digite um número entre 4 e 50.',
  quantityInvalid: 'Não consegui entender a quantidade. Digite um número entre 4 e 50.',
  added: 'Anotado: {qtd}x {equipamento} ✅',
  ropeTip:
    'Dica: para montar andaime em altura, muita gente também leva a corda de bombeiro para estaiamento.',
  askStart: 'Para quando você precisa?',
  askStartDate: 'Digite a data no formato DD/MM (por exemplo, 15/12).',
  dateInvalid:
    'Não consegui entender essa data. Use o formato DD/MM, por exemplo 15/12, e uma data de hoje em diante.',
  askPeriod: 'Por quanto tempo?',
  askPeriodOther: 'Descreva o período em poucas palavras.',
  askDelivery: 'Prefere receber na obra ou retirar com a gente?',
  askNotes:
    'Quer acrescentar alguma observação? Por exemplo: horário para entregar ou detalhe do acesso à obra.',
  askNotesText: 'Escreva a observação (até 200 caracteres).',
  summaryIntro: 'Pronto{nome}! Confere se está tudo certo:',
  summaryEmpty: 'Adicione pelo menos um equipamento para enviar o pedido.',
  summaryNote:
    'Vamos abrir o WhatsApp com a mensagem pronta. É só tocar em enviar. Valores e disponibilidade são confirmados pela nossa equipe.',
  sent: 'Prontinho! Se o WhatsApp não abriu, toque no botão abaixo.',
  handoff: 'Claro! Vou te levar para o WhatsApp da nossa equipe.',
  handoffQuestion: 'Vou levar sua dúvida para o WhatsApp da equipe.',
  searchMiss: 'Essa eu prefiro confirmar com a equipe 🙂',
  pricing:
    'Valores e disponibilidade dependem do equipamento, do período e da cidade, por isso nossa equipe confirma direto no WhatsApp. Posso montar seu pedido agora para agilizar?',
  moreHelp: 'Posso ajudar em mais alguma coisa?',
  nameGreeting: 'Prazer, {nome}!',
  cityGreeting: 'Ótimo, atendemos {cidade}!',
  voltageNotFound: 'Para os outros equipamentos, a equipe confirma a voltagem pelo WhatsApp.',
  heightNote:
    'A escada de fibra de vidro não conduz eletricidade, conforme a descrição do catálogo.',
  invalidOption: 'Não entendi essa opção. Pode tentar de novo?',
};

/** Opções de tarefa: o que a pessoa vai fazer na obra e os equipamentos sugeridos. */
export const tasks: { id: string; label: string; categories?: string[]; ids?: string[] }[] = [
  { id: 'concreto', label: 'Misturar ou aplicar concreto', categories: ['concreto'] },
  { id: 'quebrar', label: 'Quebrar ou demolir', ids: ['martelete-rompedor-5kg'] },
  { id: 'furar', label: 'Furar concreto ou parede', ids: ['martelete-perfurador-5kg'] },
  { id: 'altura', label: 'Trabalhar em altura', categories: ['altura-acesso'] },
  { id: 'pintar', label: 'Pintar paredes', ids: ['maquina-pintura'] },
  { id: 'energia', label: 'Levar energia na obra', ids: ['extensao-50m'] },
];

/** Mapeia cada pergunta frequente a um id usado no menu e nas buscas. */
export const faqTopics = [
  { id: 'horario', label: 'Horário' },
  { id: 'endereco', label: 'Endereço' },
  { id: 'cidades', label: 'Cidades atendidas' },
  { id: 'contato', label: 'Formas de contato' },
  { id: 'preco', label: 'Preços e disponibilidade' },
  { id: 'voltagem', label: 'Voltagem dos equipamentos' },
  { id: 'altura', label: 'Equipamentos para altura e NR18' },
];

/**
 * Palavras que a pessoa pode digitar, por intenção. Sem acento e em minúsculas.
 * Cada termo é procurado como palavra ou expressão inteira.
 */
export const synonyms: Record<string, string[]> = {
  horario: [
    'horario',
    'hora',
    'horas',
    'abre',
    'abrem',
    'fecha',
    'fechado',
    'aberto',
    'funciona',
    'domingo',
    'sabado',
    'feriado',
  ],
  endereco: [
    'endereco',
    'onde fica',
    'localizacao',
    'mapa',
    'rua',
    'como chegar',
    'onde voces ficam',
  ],
  cidades: ['atende', 'atendem', 'entrega em', 'regiao', 'cidade', 'cidades'],
  preco: [
    'preco',
    'precos',
    'valor',
    'valores',
    'quanto custa',
    'quanto e',
    'orcamento',
    'diaria',
    'tabela',
  ],
  pessoa: ['atendente', 'humano', 'pessoa', 'vendedor'],
  contato: ['telefone', 'whatsapp', 'zap', 'email', 'instagram', 'contato', 'falar com'],
  voltagem: ['110', '127', '220', 'voltagem', 'bivolt', 'tensao'],
  altura: ['altura', 'nr18', 'nr 18'],
};

/** Apelidos de cada equipamento (id do catálogo → termos). */
export const equipmentSynonyms: Record<string, string[]> = {
  'betoneira-400l': ['betoneira', 'misturador'],
  'martelete-rompedor-5kg': ['rompedor', 'britadeira', 'quebrar', 'demolir', 'demolicao'],
  'martelete-perfurador-5kg': ['perfurador', 'furadeira', 'furar', 'broca', 'sds'],
  'vibrador-concreto-1-2m': ['vibrador', 'mangote', 'adensar'],
  'vibrador-concreto-35mm': ['vibrador', 'mangote', 'adensar'],
  'andaime-1x1': ['andaime'],
  'andaime-1x1-5': ['andaime'],
  'corda-bombeiro-12mm': ['corda', 'estaiamento'],
  'escada-fibra-25-degraus': ['escada'],
  'escada-degrau-d-vazada': ['escada'],
  'escada-aluminio-fibra-27-degraus': ['escada'],
  'extensao-50m': ['extensao', 'cabo', 'energia'],
  'maquina-pintura': ['pintura', 'pintar', 'maquina de pintura', 'airless'],
};

/** Textos das respostas de cada pergunta frequente. Use {…} apenas para os campos listados em rosi.ts. */
export const faqAnswers = {
  pricing:
    'Valores e disponibilidade dependem do equipamento, do período e da cidade. Nossa equipe confirma direto no WhatsApp.',
};

/** Rótulos das opções de prazo, período e entrega. Mudar aqui muda o botão e a mensagem final. */
export const options = {
  start: [
    { id: 'hoje', label: 'Hoje', message: 'hoje' },
    { id: 'amanha', label: 'Amanhã', message: 'amanhã' },
    { id: 'semana', label: 'Esta semana', message: 'esta semana' },
    { id: 'data', label: 'Escolher data', message: '' },
    { id: 'nao-sei', label: 'Ainda não sei', message: 'a definir' },
  ],
  period: ['1 dia', '1 semana', '15 dias', '1 mês'],
  delivery: [
    { id: 'entrega', label: 'Entrega na obra', message: 'Entrega na obra' },
    { id: 'retirada', label: 'Vou retirar', message: 'Retirada no local' },
    { id: 'nao-sei', label: 'Ainda não sei', message: 'Entrega ou retirada a definir' },
  ],
};
