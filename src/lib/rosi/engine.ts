/**
 * Motor da Rosi: máquina de estados da conversa. Funções puras, sem DOM.
 * Os textos vêm de src/data/rosi.ts; os dados da empresa e dos equipamentos entram pelo contexto.
 */
import { texts, tasks, faqTopics, options as optionSets, faqAnswers } from '../../data/rosi';
import type { CategorySlug, Equipment } from '../../data/equipment';
import { buildWhatsAppLink, GENERAL_MESSAGE } from '../whatsapp';
import { cleanInput, matchEquipment, matchIntent, parseDayMonth } from './intents';
import { buildOrderMessage, buildQuestionMessage } from './message';

export type StepId =
  | 'welcome'
  | 'ask-name'
  | 'ask-city'
  | 'ask-city-other'
  | 'ask-task'
  | 'ask-task-text'
  | 'pick-category'
  | 'pick-equipment'
  | 'ask-quantity'
  | 'ask-quantity-custom'
  | 'item-added'
  | 'search-equipment'
  | 'ask-start'
  | 'ask-start-date'
  | 'ask-period'
  | 'ask-period-other'
  | 'ask-delivery'
  | 'ask-notes'
  | 'ask-notes-text'
  | 'summary'
  | 'sent'
  | 'faq-menu'
  | 'faq-next'
  | 'search-miss'
  | 'handoff';

export interface OrderItem {
  equipmentId: string;
  quantity: number;
}

export interface ChatMessage {
  from: 'rosi' | 'user';
  text: string;
}

export interface RosiState {
  step: StepId;
  history: StepId[];
  name?: string;
  city?: string;
  cityOutsideArea?: boolean;
  items: OrderItem[];
  category?: CategorySlug;
  recommend?: string[];
  pendingEquipment?: string;
  lastAdded?: string;
  startWhen?: 'hoje' | 'amanha' | 'esta-semana' | 'data' | 'nao-sei';
  startDate?: string;
  period?: string;
  delivery?: 'entrega' | 'retirada' | 'nao-sei';
  notes?: string;
  faqTopic?: string;
  lastQuestion?: string;
  editing: boolean;
  messages: ChatMessage[];
}

export interface RosiContext {
  equipment: readonly Equipment[];
  cities: readonly string[];
  isOpen: boolean;
  statusLabel: string;
  mapsHref: string;
  instagram: string;
  phone: string;
  email: string;
  hoursText: string;
  addressText: string;
  today: Date;
}

export interface Option {
  id: string;
  label: string;
  href?: string;
}

export type RosiAction =
  { type: 'option'; id: string } | { type: 'text'; text: string } | { type: 'restart' };

const MAX_NAME = 40;
const MAX_CITY = 60;
const MAX_NOTES = 200;
const MAX_PERIOD = 40;
const MIN_QTY = 1;
const MAX_QTY = 50;

const TEXT_STEPS: StepId[] = [
  'ask-name',
  'ask-city-other',
  'ask-task-text',
  'ask-quantity-custom',
  'ask-start-date',
  'ask-period-other',
  'ask-notes',
  'ask-notes-text',
];

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');

const say = (state: RosiState, text: string): RosiState => ({
  ...state,
  messages: [...state.messages, { from: 'rosi', text }],
});

const userSay = (state: RosiState, text: string): RosiState => ({
  ...state,
  messages: [...state.messages, { from: 'user', text }],
});

export function createState(ctx: RosiContext): RosiState {
  let state: RosiState = { step: 'welcome', history: [], items: [], editing: false, messages: [] };
  state = say(state, texts.welcome.join(' '));
  if (!ctx.isOpen) state = say(state, texts.closedNotice);
  return state;
}

export function expectsText(state: RosiState): boolean {
  return TEXT_STEPS.includes(state.step);
}

export function placeholderFor(state: RosiState): string {
  if (state.step === 'ask-name') return 'Seu nome (opcional)';
  if (state.step === 'ask-city-other') return 'Nome da cidade';
  if (state.step === 'ask-start-date') return 'DD/MM';
  if (state.step === 'ask-notes-text') return 'Observação (até 200 caracteres)';
  if (expectsText(state)) return 'Escreva aqui';
  return 'Digite sua dúvida…';
}

function equipmentName(ctx: RosiContext, id: string | undefined): string {
  return ctx.equipment.find((item) => item.id === id)?.name ?? '';
}

function resolveTask(taskId: string, ctx: RosiContext): string[] {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return [];
  if (task.ids) return [...task.ids];
  return ctx.equipment
    .filter((item) => task.categories?.includes(item.category))
    .map((item) => item.id);
}

function candidateEquipment(state: RosiState, ctx: RosiContext): Equipment[] {
  if (state.recommend?.length) {
    return state.recommend
      .map((id) => ctx.equipment.find((item) => item.id === id))
      .filter((item): item is Equipment => Boolean(item));
  }
  return ctx.equipment.filter((item) => !state.category || item.category === state.category);
}

/** Respostas das perguntas frequentes, sempre a partir dos dados. */
export function faqAnswer(topic: string, ctx: RosiContext): string {
  switch (topic) {
    case 'horario':
      return `Atendemos ${ctx.hoursText}, das 7h às 22h. ${ctx.statusLabel}.`;
    case 'endereco':
      return `Estamos na ${ctx.addressText}. Você pode abrir no mapa pelo botão abaixo.`;
    case 'cidades':
      return `Atendemos ${ctx.cities.join(', ')}. Em outra cidade? Consulte a equipe.`;
    case 'contato':
      return `WhatsApp, telefone ${ctx.phone}, e-mail ${ctx.email} ou Instagram ${ctx.instagram}.`;
    case 'preco':
      return texts.pricing;
    case 'voltagem': {
      const electric = ctx.equipment.filter((item) =>
        item.specs.some((spec) => spec.includes('220 V')),
      );
      const list = electric.map((item) => `${item.name}: 220 V`).join('; ');
      return `${list}. ${texts.voltageNotFound}`;
    }
    case 'altura': {
      const nr18 = ctx.equipment.filter(
        (item) =>
          item.category === 'altura-acesso' && item.specs.some((spec) => spec.includes('NR18')),
      );
      return `Com NR18: ${nr18.map((item) => item.name).join('; ')}. ${texts.heightNote}`;
    }
    default:
      return faqAnswers.pricing;
  }
}

export function promptFor(state: RosiState, ctx: RosiContext): string {
  switch (state.step) {
    case 'welcome':
      return '';
    case 'ask-name':
      return texts.askName;
    case 'ask-city':
      return texts.askCity;
    case 'ask-city-other':
      return 'Digite o nome da cidade.';
    case 'ask-task':
      return texts.askTask;
    case 'ask-task-text':
      return 'Me conta rapidinho o que você precisa.';
    case 'pick-category':
      return texts.askCategory;
    case 'pick-equipment':
      return state.recommend?.length ? texts.recommended : texts.pickEquipment;
    case 'ask-quantity':
      return fill(texts.askQuantity, { equipamento: equipmentName(ctx, state.pendingEquipment) });
    case 'ask-quantity-custom':
      return texts.askQuantityCustom;
    case 'item-added':
      return fill(texts.added, {
        qtd: String(state.items.find((i) => i.equipmentId === state.lastAdded)?.quantity ?? 1),
        equipamento: equipmentName(ctx, state.lastAdded),
      });
    case 'search-equipment':
      return `Encontrei: ${equipmentName(ctx, state.pendingEquipment)}. Quer adicionar ao pedido?`;
    case 'ask-start':
      return texts.askStart;
    case 'ask-start-date':
      return texts.askStartDate;
    case 'ask-period':
      return texts.askPeriod;
    case 'ask-period-other':
      return texts.askPeriodOther;
    case 'ask-delivery':
      return texts.askDelivery;
    case 'ask-notes':
      return texts.askNotes;
    case 'ask-notes-text':
      return texts.askNotesText;
    case 'summary':
      return fill(texts.summaryIntro, { nome: state.name ? `, ${state.name}` : '' });
    case 'sent':
      return texts.sent;
    case 'faq-menu':
      return 'Escolha uma dúvida:';
    case 'faq-next':
      return texts.moreHelp;
    case 'search-miss':
      return texts.searchMiss;
    case 'handoff':
      return state.lastQuestion ? texts.handoffQuestion : texts.handoff;
  }
}

/** Botões da etapa atual. O "Voltar" aparece em todas as etapas, exceto a primeira. */
export function optionsFor(state: RosiState, ctx: RosiContext): Option[] {
  const base: Option[] = (() => {
    switch (state.step) {
      case 'welcome':
        return [
          { id: 'order', label: 'Quero alugar um equipamento' },
          { id: 'help', label: 'Não sei qual equipamento usar' },
          { id: 'faq', label: 'Tirar uma dúvida' },
          { id: 'human', label: 'Falar com uma pessoa' },
        ];
      case 'ask-name':
        return [{ id: 'skip', label: 'Pular' }];
      case 'ask-city':
        return [
          ...ctx.cities.map((city) => ({ id: `city:${city}`, label: city })),
          { id: 'city-other', label: 'Outra cidade' },
        ];
      case 'ask-task':
        return [
          ...tasks.map((task) => ({ id: `task:${task.id}`, label: task.label })),
          { id: 'task-other', label: 'Outra coisa' },
          { id: 'human', label: 'Falar com uma pessoa' },
        ];
      case 'pick-category':
        return [
          ...ctx.equipment
            .map((item) => item.category)
            .filter((slug, i, all) => all.indexOf(slug) === i)
            .map((slug) => ({ id: `cat:${slug}`, label: categoryLabel(slug) })),
          { id: 'cat:all', label: 'Ver todos' },
        ];
      case 'pick-equipment':
        return candidateEquipment(state, ctx).map((item) => ({
          id: `eq:${item.id}`,
          label: item.name,
        }));
      case 'ask-quantity':
        return [
          { id: 'qty:1', label: '1' },
          { id: 'qty:2', label: '2' },
          { id: 'qty:3', label: '3' },
          { id: 'qty:4', label: '4 ou mais' },
        ];
      case 'item-added': {
        const list: Option[] = [
          { id: 'add-more', label: 'Adicionar outro equipamento' },
          { id: 'done', label: 'Só isso' },
        ];
        const isScaffold = state.lastAdded?.startsWith('andaime') ?? false;
        const hasRope = state.items.some((i) => i.equipmentId === 'corda-bombeiro-12mm');
        if (isScaffold && !hasRope) list.splice(1, 0, { id: 'rope', label: 'Adicionar corda' });
        return list;
      }
      case 'search-equipment': {
        const id = state.pendingEquipment ?? '';
        return [
          { id: `add-found:${id}`, label: 'Adicionar ao pedido' },
          { id: 'details', label: 'Ver detalhes', href: `/equipamentos#${id}` },
        ];
      }
      case 'ask-start':
        return optionSets.start.map((o) => ({ id: `start:${o.id}`, label: o.label }));
      case 'ask-period':
        return [
          ...optionSets.period.map((label) => ({ id: `period:${label}`, label })),
          { id: 'period-other', label: 'Outro período' },
          { id: 'period:nao-sei', label: 'Ainda não sei' },
        ];
      case 'ask-delivery':
        return optionSets.delivery.map((o) => ({ id: `delivery:${o.id}`, label: o.label }));
      case 'ask-notes':
        return [{ id: 'notes-skip', label: 'Não, tudo certo' }];
      case 'summary':
        return [
          { id: 'add', label: 'Adicionar outro equipamento' },
          { id: 'send', label: 'Enviar pedido no WhatsApp' },
        ];
      case 'faq-menu':
        return faqTopics.map((topic) => ({ id: `faq:${topic.id}`, label: topic.label }));
      case 'faq-next': {
        const list: Option[] = [];
        if (state.faqTopic === 'endereco')
          list.push({ id: 'map', label: 'Abrir no mapa', href: ctx.mapsHref });
        list.push(
          { id: 'order', label: 'Montar pedido' },
          { id: 'faq', label: 'Outra dúvida' },
          { id: 'human', label: 'Falar com uma pessoa' },
        );
        return list;
      }
      case 'search-miss':
        return [
          { id: 'faq', label: 'Ver o menu' },
          { id: 'ask-whatsapp', label: 'Perguntar no WhatsApp' },
        ];
      default:
        return [];
    }
  })();
  if (state.history.length > 0 && state.step !== 'welcome' && state.step !== 'sent') {
    return [...base, { id: 'back', label: 'Voltar' }];
  }
  return base;
}

function categoryLabel(slug: string): string {
  const labels: Record<string, string> = {
    concreto: 'Concreto e argamassa',
    'demolicao-perfuracao': 'Demolição e perfuração',
    'altura-acesso': 'Altura e acesso',
    eletrica: 'Energia e elétrica',
    pintura: 'Pintura',
  };
  return labels[slug] ?? slug;
}

/** Passa para uma nova etapa, guarda a anterior no histórico e registra a fala da Rosi. */
function enter(state: RosiState, step: StepId, ctx: RosiContext, pre: string[] = []): RosiState {
  let next: RosiState = { ...state, step, history: [...state.history, state.step] };
  for (const text of pre) next = say(next, text);
  return say(next, promptFor(next, ctx));
}

/** Volta uma etapa. Não cria histórico novo. */
function goBack(state: RosiState, ctx: RosiContext): RosiState {
  const previous = state.history[state.history.length - 1];
  if (!previous) return state;
  const next = userSay({ ...state, step: previous, history: state.history.slice(0, -1) }, 'Voltar');
  return say(next, promptFor(next, ctx));
}

function addItem(state: RosiState, equipmentId: string, quantity: number): RosiState {
  const existing = state.items.find((i) => i.equipmentId === equipmentId);
  const items = existing
    ? state.items.map((i) =>
        i.equipmentId === equipmentId
          ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) }
          : i,
      )
    : [...state.items, { equipmentId, quantity: Math.min(MAX_QTY, quantity) }];
  return { ...state, items, lastAdded: equipmentId };
}

/** Próxima etapa depois de um item: pede a cidade se faltar, senão segue para o início. */
function afterItems(state: RosiState, ctx: RosiContext): RosiState {
  if (!state.city) return enter(state, 'ask-city', ctx);
  if (state.editing) return enter(state, 'summary', ctx);
  return enter(state, 'ask-start', ctx);
}

function afterCity(state: RosiState, ctx: RosiContext): RosiState {
  if (state.editing) return enter(state, 'summary', ctx);
  if (state.items.length > 0) return enter(state, 'ask-start', ctx);
  return enter(state, 'pick-category', ctx);
}

function afterStep(state: RosiState, ctx: RosiContext, next: StepId): RosiState {
  return state.editing ? enter(state, 'summary', ctx) : enter(state, next, ctx);
}

function faqAction(state: RosiState, topic: string, ctx: RosiContext): RosiState {
  const answered = { ...state, faqTopic: topic };
  return enter(answered, 'faq-next', ctx, [faqAnswer(topic, ctx)]);
}

/** Texto digitado fora de uma pergunta: procura intenção ou equipamento. */
function searchText(state: RosiState, text: string, ctx: RosiContext): RosiState {
  const equipmentId = matchEquipment(
    text,
    ctx.equipment.map((item) => item.id),
  );
  if (equipmentId) {
    return enter({ ...state, pendingEquipment: equipmentId }, 'search-equipment', ctx);
  }
  const intent = matchIntent(text);
  if (intent === 'pessoa') return enter(state, 'handoff', ctx);
  if (
    intent &&
    ['horario', 'endereco', 'cidades', 'contato', 'preco', 'voltagem', 'altura'].includes(intent)
  ) {
    return faqAction(state, intent, ctx);
  }
  return enter({ ...state, lastQuestion: text }, 'search-miss', ctx);
}

function handleText(state: RosiState, text: string, ctx: RosiContext): RosiState {
  switch (state.step) {
    case 'ask-name': {
      const name = cleanInput(text, MAX_NAME);
      const greeted = name ? fill(texts.nameGreeting, { nome: name }) : undefined;
      return enter(
        { ...state, name: name || undefined },
        'ask-city',
        ctx,
        greeted ? [greeted] : [],
      );
    }
    case 'ask-city-other': {
      const city = cleanInput(text, MAX_CITY);
      if (!city) return say(state, texts.invalidOption);
      return afterCity(say({ ...state, city, cityOutsideArea: true }, texts.cityOutside), ctx);
    }
    case 'ask-task-text':
      return searchText(state, text, ctx);
    case 'ask-quantity-custom': {
      const quantity = Number.parseInt(text, 10);
      if (!Number.isInteger(quantity) || quantity < 4 || quantity > MAX_QTY) {
        return say(state, texts.quantityInvalid);
      }
      const added = addItem(state, state.pendingEquipment ?? '', quantity);
      return enter(added, 'item-added', ctx);
    }
    case 'ask-start-date': {
      const date = parseDayMonth(text, ctx.today);
      if (!date) return say(state, texts.dateInvalid);
      return afterStep({ ...state, startWhen: 'data', startDate: date }, ctx, 'ask-period');
    }
    case 'ask-period-other': {
      const period = cleanInput(text, MAX_PERIOD);
      if (!period) return say(state, texts.invalidOption);
      return afterStep({ ...state, period }, ctx, 'ask-delivery');
    }
    case 'ask-notes':
    case 'ask-notes-text': {
      const notes = cleanInput(text, MAX_NOTES);
      return enter({ ...state, notes: notes || undefined }, 'summary', ctx);
    }
    default:
      return searchText(state, text, ctx);
  }
}

function handleOption(state: RosiState, id: string, ctx: RosiContext): RosiState {
  const [head, ...rest] = id.split(':');
  const value = rest.join(':');

  // Ações da lista de resumo: não criam mensagens, só alteram o pedido.
  if (head === 'item+' || head === 'item-' || head === 'item-del') {
    const items = state.items
      .map((i) => {
        if (i.equipmentId !== value) return i;
        if (head === 'item+') return { ...i, quantity: Math.min(MAX_QTY, i.quantity + 1) };
        if (head === 'item-') return { ...i, quantity: Math.max(MIN_QTY, i.quantity - 1) };
        return null;
      })
      .filter((i): i is OrderItem => i !== null);
    return { ...state, items };
  }
  if (head === 'edit') {
    const editing = { ...state, editing: true };
    const target = value as StepId;
    return enter(editing, target, ctx);
  }

  switch (state.step) {
    case 'welcome':
      if (id === 'order') return enter(state, 'ask-name', ctx);
      if (id === 'help') return enter(state, 'ask-task', ctx);
      if (id === 'faq') return enter(state, 'faq-menu', ctx);
      if (id === 'human') return enter(state, 'handoff', ctx);
      break;
    case 'ask-name':
      if (id === 'skip') return enter(state, 'ask-city', ctx);
      break;
    case 'ask-city':
      if (id === 'city-other') return enter(state, 'ask-city-other', ctx);
      if (head === 'city') return afterCity({ ...state, city: value, cityOutsideArea: false }, ctx);
      break;
    case 'ask-task':
      if (id === 'task-other') return enter(state, 'ask-task-text', ctx);
      if (id === 'human') return enter(state, 'handoff', ctx);
      if (head === 'task')
        return enter({ ...state, recommend: resolveTask(value, ctx) }, 'pick-equipment', ctx);
      break;
    case 'pick-category':
      if (id === 'cat:all') return enter({ ...state, category: undefined }, 'pick-equipment', ctx);
      if (head === 'cat')
        return enter({ ...state, category: value as CategorySlug }, 'pick-equipment', ctx);
      break;
    case 'pick-equipment':
      if (head === 'eq') return enter({ ...state, pendingEquipment: value }, 'ask-quantity', ctx);
      break;
    case 'ask-quantity':
      if (id === 'qty:4') return enter(state, 'ask-quantity-custom', ctx);
      if (head === 'qty') {
        const quantity = Number(value);
        return enter(addItem(state, state.pendingEquipment ?? '', quantity), 'item-added', ctx);
      }
      break;
    case 'item-added':
      if (id === 'add-more') return enter(state, 'pick-category', ctx);
      if (id === 'done') return afterItems(state, ctx);
      if (id === 'rope') return enter(addItem(state, 'corda-bombeiro-12mm', 1), 'item-added', ctx);
      break;
    case 'search-equipment':
      if (head === 'add-found')
        return enter({ ...state, pendingEquipment: value }, 'ask-quantity', ctx);
      break;
    case 'ask-start':
      if (head === 'start') {
        if (value === 'data') return enter(state, 'ask-start-date', ctx);
        const map = {
          hoje: 'hoje',
          amanha: 'amanha',
          semana: 'esta-semana',
          'nao-sei': 'nao-sei',
        } as const;
        const startWhen = map[value as keyof typeof map] ?? 'nao-sei';
        return afterStep({ ...state, startWhen, startDate: undefined }, ctx, 'ask-period');
      }
      break;
    case 'ask-period':
      if (id === 'period-other') return enter(state, 'ask-period-other', ctx);
      if (head === 'period') {
        return afterStep(
          { ...state, period: value === 'nao-sei' ? undefined : value },
          ctx,
          'ask-delivery',
        );
      }
      break;
    case 'ask-delivery':
      if (head === 'delivery') {
        return afterStep({ ...state, delivery: value as RosiState['delivery'] }, ctx, 'ask-notes');
      }
      break;
    case 'ask-notes':
      if (id === 'notes-skip') return enter(state, 'summary', ctx);
      break;
    case 'summary':
      if (id === 'add') return enter({ ...state, editing: true }, 'pick-category', ctx);
      if (id === 'send' && state.items.length > 0) return enter(state, 'sent', ctx);
      break;
    case 'faq-menu':
      if (head === 'faq') return faqAction(state, value, ctx);
      break;
    case 'faq-next':
      if (id === 'order') return enter(state, 'ask-name', ctx);
      if (id === 'faq') return enter(state, 'faq-menu', ctx);
      if (id === 'human') return enter(state, 'handoff', ctx);
      break;
    case 'search-miss':
      if (id === 'faq') return enter(state, 'faq-menu', ctx);
      if (id === 'ask-whatsapp') return enter(state, 'handoff', ctx);
      break;
  }
  return say(state, texts.invalidOption);
}

/** Aplica uma ação do visitante e devolve o novo estado. Função pura. */
export function respond(state: RosiState, action: RosiAction, ctx: RosiContext): RosiState {
  if (action.type === 'restart') return createState(ctx);

  if (action.type === 'text') {
    const text = cleanInput(action.text, 300);
    if (!text) return state;
    const withUser = userSay(state, text);
    return handleText(withUser, text, ctx);
  }

  if (action.id === 'back') return goBack(state, ctx);

  // Ações de resumo (edição de itens e de campos) são tratadas sem mensagem do visitante.
  const summaryAction = /^(item\+|item-|item-del|edit):/.test(action.id);
  if (summaryAction) return handleOption(state, action.id, ctx);

  const option = optionsFor(state, ctx).find((o) => o.id === action.id);
  if (!option) return say(state, texts.invalidOption);
  if (option.href) return state;
  const withUser = userSay(state, option.label);
  return handleOption(withUser, action.id, ctx);
}

/** Mensagem do WhatsApp para o pedido atual. */
export function orderHref(state: RosiState, ctx: RosiContext): string {
  return buildWhatsAppLink(buildOrderMessage(state, ctx.equipment));
}

/** Mensagem do WhatsApp quando a conversa é encaminhada para uma pessoa. */
export function handoffHref(state: RosiState): string {
  if (state.lastQuestion) return buildWhatsAppLink(buildQuestionMessage(state.lastQuestion));
  return buildWhatsAppLink(GENERAL_MESSAGE);
}

export interface SummaryLine {
  label: string;
  value: string;
  edit: StepId;
}

/** Linhas do resumo, usadas no painel e na mensagem final. */
export function summaryLines(state: RosiState, ctx: RosiContext): SummaryLine[] {
  const startLabel = {
    hoje: 'Hoje',
    amanha: 'Amanhã',
    'esta-semana': 'Esta semana',
    data: state.startDate ?? 'a definir',
    'nao-sei': 'A definir',
  }[state.startWhen ?? 'nao-sei'];
  const deliveryLabel = {
    entrega: 'Entrega na obra',
    retirada: 'Retirada no local',
    'nao-sei': 'A definir',
  }[state.delivery ?? 'nao-sei'];
  return [
    {
      label: 'Cidade',
      value: state.city
        ? `${state.city}${state.cityOutsideArea ? ' (fora da lista)' : ''}`
        : 'a definir',
      edit: 'ask-city',
    },
    {
      label: 'Equipamentos',
      value:
        state.items.map((i) => `${i.quantity}x ${equipmentName(ctx, i.equipmentId)}`).join(', ') ||
        'nenhum',
      edit: 'pick-category',
    },
    { label: 'Início', value: startLabel, edit: 'ask-start' },
    { label: 'Período', value: state.period ?? 'a definir', edit: 'ask-period' },
    { label: 'Entrega', value: deliveryLabel, edit: 'ask-delivery' },
    { label: 'Observação', value: state.notes ?? 'nenhuma', edit: 'ask-notes' },
  ];
}

/** Abre a conversa já com um equipamento escolhido (botão "Adicionar ao pedido com a Rosi"). */
export function startWithEquipment(
  state: RosiState,
  equipmentId: string,
  ctx: RosiContext,
): RosiState {
  const name = ctx.equipment.find((item) => item.id === equipmentId)?.name ?? equipmentId;
  const withUser = userSay(state, `Quero adicionar: ${name}`);
  return enter({ ...withUser, pendingEquipment: equipmentId }, 'ask-quantity', ctx);
}

export const ROSI_LIMITS = { MIN_QTY, MAX_QTY, MAX_NAME, MAX_CITY, MAX_NOTES, MAX_PERIOD };
