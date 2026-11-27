import { describe, expect, it } from 'vitest';
import {
  createState,
  optionsFor,
  respond,
  summaryLines,
  type RosiState,
} from '../../src/lib/rosi/engine';
import { buildContext } from '../../src/lib/rosi/context';

// São Paulo é UTC-3: 10h da manhã = 13h UTC; 23h = 02h UTC do dia seguinte.
const ctx = buildContext(new Date('2026-11-26T13:00:00Z'));
const closedCtx = buildContext(new Date('2026-11-27T02:00:00Z'));

const pick = (state: RosiState, id: string, c = ctx) => respond(state, { type: 'option', id }, c);
const say = (state: RosiState, text: string, c = ctx) => respond(state, { type: 'text', text }, c);
const saidContaining = (state: RosiState, text: string) =>
  state.messages.some((m) => m.from === 'rosi' && m.text.includes(text));

/** Percorre o pedido completo: cidade, 1 betoneira, início amanhã, 1 semana, entrega. */
function completeOrder(): RosiState {
  let s = createState(ctx);
  s = pick(s, 'order');
  s = pick(s, 'skip');
  s = pick(s, 'city:Santana de Parnaíba');
  s = pick(s, 'cat:concreto');
  s = pick(s, 'eq:betoneira-400l');
  s = pick(s, 'qty:2');
  s = pick(s, 'done');
  s = pick(s, 'start:amanha');
  s = pick(s, 'period:1 semana');
  s = pick(s, 'delivery:entrega');
  s = pick(s, 'notes-skip');
  return s;
}

describe('roteiro principal', () => {
  it('chega ao resumo com o pedido completo', () => {
    const s = completeOrder();
    expect(s.step).toBe('summary');
    expect(s.items).toEqual([{ equipmentId: 'betoneira-400l', quantity: 2 }]);
    expect(s.city).toBe('Santana de Parnaíba');
    expect(s.delivery).toBe('entrega');
    expect(summaryLines(s, ctx).find((l) => l.label === 'Equipamentos')?.value).toBe(
      '2x Betoneira 400 L',
    );
  });

  it('avisa quando a Rosimaq está fechada, sem bloquear o pedido', () => {
    const s = createState(closedCtx);
    expect(s.messages.some((m) => m.text.includes('Agora estamos fechados'))).toBe(true);
    expect(pick(s, 'order', closedCtx).step).toBe('ask-name');
  });

  it('pergunta a cidade quando ela ainda não foi informada', () => {
    let s = createState(ctx);
    s = pick(s, 'help');
    s = pick(s, 'task:quebrar');
    s = pick(s, 'eq:martelete-rompedor-5kg');
    s = pick(s, 'qty:1');
    s = pick(s, 'done');
    expect(s.step).toBe('ask-city');
  });

  it('aceita quantidade 4 ou mais digitada, dentro do limite', () => {
    let s = createState(ctx);
    s = pick(s, 'order');
    s = pick(s, 'skip');
    s = pick(s, 'city:Cajamar');
    s = pick(s, 'cat:demolicao-perfuracao');
    s = pick(s, 'eq:martelete-rompedor-5kg');
    s = pick(s, 'qty:4');
    expect(s.step).toBe('ask-quantity-custom');
    s = say(s, '99');
    expect(s.step).toBe('ask-quantity-custom');
    s = say(s, '6');
    expect(s.items).toEqual([{ equipmentId: 'martelete-rompedor-5kg', quantity: 6 }]);
  });

  it('oferece corda de bombeiro depois de andaime, uma única vez', () => {
    let s = createState(ctx);
    s = pick(s, 'order');
    s = pick(s, 'skip');
    s = pick(s, 'city:Itapevi');
    s = pick(s, 'cat:altura-acesso');
    s = pick(s, 'eq:andaime-1x1');
    s = pick(s, 'qty:1');
    expect(optionsFor(s, ctx).some((o) => o.id === 'rope')).toBe(true);
    s = pick(s, 'rope');
    expect(s.items.some((i) => i.equipmentId === 'corda-bombeiro-12mm')).toBe(true);
    expect(optionsFor(s, ctx).some((o) => o.id === 'rope')).toBe(false);
  });
});

describe('voltar e recomeçar', () => {
  it('"Voltar" retorna à etapa anterior sem perder o que já foi respondido', () => {
    let s = createState(ctx);
    s = pick(s, 'order');
    s = pick(s, 'skip');
    s = pick(s, 'city:Barueri');
    expect(s.step).toBe('pick-category');
    s = pick(s, 'back');
    expect(s.step).toBe('ask-city');
    expect(s.city).toBe('Barueri');
  });

  it('não mostra "Voltar" na primeira etapa', () => {
    const s = createState(ctx);
    expect(optionsFor(s, ctx).some((o) => o.id === 'back')).toBe(false);
  });

  it('recomeçar zera o estado', () => {
    const s = respond(completeOrder(), { type: 'restart' }, ctx);
    expect(s.step).toBe('welcome');
    expect(s.items).toEqual([]);
    expect(s.city).toBeUndefined();
  });
});

describe('editar pelo resumo', () => {
  it('ajusta a cidade e volta ao resumo', () => {
    const s = pick(completeOrder(), 'edit:ask-city');
    expect(s.step).toBe('ask-city');
    const s2 = pick(s, 'city:Pirapora do Bom Jesus');
    expect(s2.step).toBe('summary');
    expect(s2.city).toBe('Pirapora do Bom Jesus');
  });

  it('aumenta, diminui e remove itens sem criar mensagens novas', () => {
    let s = completeOrder();
    const count = s.messages.length;
    s = pick(s, 'item+:betoneira-400l');
    expect(s.items[0]?.quantity).toBe(3);
    s = pick(s, 'item-:betoneira-400l');
    s = pick(s, 'item-:betoneira-400l');
    s = pick(s, 'item-:betoneira-400l');
    expect(s.items[0]?.quantity).toBe(1);
    s = pick(s, 'item-del:betoneira-400l');
    expect(s.items).toEqual([]);
    expect(s.messages.length).toBe(count);
  });
});

describe('texto livre e buscas', () => {
  it('responde horário digitado com a informação dos dados', () => {
    const s = say(createState(ctx), 'qual o horário de domingo?');
    expect(s.step).toBe('faq-next');
    expect(saidContaining(s, '7h às 22h')).toBe(true);
  });

  it('encontra equipamento digitado e oferece adicionar', () => {
    const s = say(createState(ctx), 'preciso de uma britadeira');
    expect(s.step).toBe('search-equipment');
    expect(optionsFor(s, ctx).some((o) => o.id === 'add-found:martelete-rompedor-5kg')).toBe(true);
  });

  it('encaminha para o WhatsApp com a dúvida quando nada combina', () => {
    const s = say(createState(ctx), 'tem estacionamento para caminhão?');
    expect(s.step).toBe('search-miss');
    expect(s.lastQuestion).toBe('tem estacionamento para caminhão?');
    const handoff = pick(s, 'ask-whatsapp');
    expect(handoff.step).toBe('handoff');
  });

  it('pessoa pedida no texto vai direto para o atendimento', () => {
    expect(say(createState(ctx), 'quero falar com um atendente').step).toBe('handoff');
  });

  it('data inválida pede de novo, data futura é aceita', () => {
    let s = createState(ctx);
    s = pick(s, 'order');
    s = pick(s, 'skip');
    s = pick(s, 'city:Cajamar');
    s = pick(s, 'cat:pintura');
    s = pick(s, 'eq:maquina-pintura');
    s = pick(s, 'qty:1');
    s = pick(s, 'done');
    s = pick(s, 'start:data');
    expect(s.step).toBe('ask-start-date');
    s = say(s, '31/02');
    expect(s.step).toBe('ask-start-date');
    s = say(s, '20/12');
    expect(s.step).toBe('ask-period');
    expect(s.startDate).toBe('20/12');
  });

  it('observação digitada é limitada a 200 caracteres', () => {
    let s = pick(completeOrder(), 'edit:ask-notes');
    s = say(s, 'x'.repeat(300));
    expect(s.notes?.length).toBe(200);
    expect(s.step).toBe('summary');
  });
});

describe('perguntas frequentes', () => {
  it('altura lista só os itens com NR18', () => {
    let s = pick(createState(ctx), 'faq');
    s = pick(s, 'faq:altura');
    expect(saidContaining(s, 'Andaime profissional de aço 1,00 x 1,00')).toBe(true);
    expect(saidContaining(s, 'Escada extensível')).toBe(false);
  });

  it('voltagem não inventa valor para equipamento sem voltagem na especificação', () => {
    let s = pick(createState(ctx), 'faq');
    s = pick(s, 'faq:voltagem');
    expect(saidContaining(s, 'Betoneira 400 L: 220 V')).toBe(true);
    expect(saidContaining(s, 'Extensão elétrica 50 m: 220 V')).toBe(false);
  });
});
