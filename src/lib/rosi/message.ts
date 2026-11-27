/**
 * Mensagem final enviada ao WhatsApp. Função pura.
 * Texto digitado pelo visitante entra como texto puro: nunca como HTML.
 */
import type { Equipment } from '../../data/equipment';
import type { RosiState } from './engine';

export const MAX_MESSAGE_LENGTH = 1500;

const startText = (state: RosiState): string => {
  switch (state.startWhen) {
    case 'hoje':
      return 'hoje';
    case 'amanha':
      return 'amanhã';
    case 'esta-semana':
      return 'esta semana';
    case 'data':
      return state.startDate ?? 'a definir';
    default:
      return 'a definir';
  }
};

const deliveryText = (state: RosiState): string => {
  switch (state.delivery) {
    case 'entrega':
      return 'Entrega na obra';
    case 'retirada':
      return 'Retirada no local';
    default:
      return 'Entrega ou retirada a definir';
  }
};

/** Monta a mensagem do pedido. Omite linhas vazias e corta observações longas. */
export function buildOrderMessage(state: RosiState, equipment: readonly Equipment[]): string {
  const name = (id: string) => equipment.find((item) => item.id === id)?.name ?? id;
  const lines: (string | null)[] = [
    'Olá, Rosimaq! Vim pelo site e fiz o pré-atendimento com a Rosi.',
    '',
    state.name ? `👤 Nome: ${state.name}` : null,
    state.city
      ? `📍 Cidade da obra: ${state.city}${state.cityOutsideArea ? ' (fora da lista de atendimento)' : ''}`
      : null,
    '🛠️ Equipamentos:',
    ...state.items.map((item) => `• ${item.quantity}x ${name(item.equipmentId)}`),
    `📅 Início: ${startText(state)}`,
    `⏱️ Período: ${state.period ?? 'a definir'}`,
    `🚚 ${deliveryText(state)}`,
    state.notes ? `📝 Observação: ${state.notes}` : null,
    '',
    'Pode me passar valores e disponibilidade?',
  ];
  let message = lines.filter((line): line is string => line !== null).join('\n');
  if (message.length > MAX_MESSAGE_LENGTH && state.notes) {
    const overflow = message.length - MAX_MESSAGE_LENGTH;
    const shorter = state.notes.slice(0, Math.max(0, state.notes.length - overflow - 3)) + '...';
    message = lines
      .map((line) => (line?.startsWith('📝') ? `📝 Observação: ${shorter}` : line))
      .filter((line): line is string => line !== null)
      .join('\n');
  }
  return message.slice(0, MAX_MESSAGE_LENGTH);
}

/** Mensagem para dúvidas que a Rosi não soube responder. */
export function buildQuestionMessage(question: string): string {
  return `Olá, Rosimaq! Vim pelo site e tenho uma dúvida: ${question}`.slice(0, MAX_MESSAGE_LENGTH);
}
