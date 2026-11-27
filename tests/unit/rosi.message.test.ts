import { describe, expect, it } from 'vitest';
import {
  buildOrderMessage,
  buildQuestionMessage,
  MAX_MESSAGE_LENGTH,
} from '../../src/lib/rosi/message';
import { createState, type RosiState } from '../../src/lib/rosi/engine';
import { equipment } from '../../src/data/equipment';
import { buildContext } from '../../src/lib/rosi/context';
import { buildWhatsAppLink } from '../../src/lib/whatsapp';

const base = (): RosiState => createState(buildContext(new Date(2026, 10, 26, 10)));

describe('buildOrderMessage', () => {
  it('monta a mensagem completa com nome, cidade, itens, início, período, entrega e observação', () => {
    const state: RosiState = {
      ...base(),
      name: 'Ana',
      city: 'Barueri',
      items: [
        { equipmentId: 'betoneira-400l', quantity: 2 },
        { equipmentId: 'andaime-1x1', quantity: 4 },
      ],
      startWhen: 'amanha',
      period: '1 semana',
      delivery: 'entrega',
      notes: 'Portão azul',
    };
    const message = buildOrderMessage(state, equipment);
    expect(message).toContain('👤 Nome: Ana');
    expect(message).toContain('📍 Cidade da obra: Barueri');
    expect(message).toContain('• 2x Betoneira 400 L');
    expect(message).toContain('• 4x Andaime profissional de aço 1,00 x 1,00');
    expect(message).toContain('📅 Início: amanhã');
    expect(message).toContain('⏱️ Período: 1 semana');
    expect(message).toContain('🚚 Entrega na obra');
    expect(message).toContain('📝 Observação: Portão azul');
    expect(message.endsWith('Pode me passar valores e disponibilidade?')).toBe(true);
  });

  it('omite nome e observação quando estão vazios e marca cidade fora da lista', () => {
    const state: RosiState = {
      ...base(),
      city: 'Osasco',
      cityOutsideArea: true,
      items: [{ equipmentId: 'extensao-50m', quantity: 1 }],
    };
    const message = buildOrderMessage(state, equipment);
    expect(message).not.toContain('Nome:');
    expect(message).not.toContain('Observação');
    expect(message).toContain('(fora da lista de atendimento)');
    expect(message).toContain('📅 Início: a definir');
  });

  it('usa a data escolhida quando o início é uma data', () => {
    const state: RosiState = { ...base(), items: [], startWhen: 'data', startDate: '15/12' };
    expect(buildOrderMessage(state, equipment)).toContain('📅 Início: 15/12');
  });

  it('nunca passa do limite e mantém acentos e emojis codificados no link', () => {
    const state: RosiState = {
      ...base(),
      items: [{ equipmentId: 'extensao-50m', quantity: 1 }],
      notes: 'ação '.repeat(400),
    };
    const message = buildOrderMessage(state, equipment);
    expect(message.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
    const link = buildWhatsAppLink(message);
    expect(link.startsWith('https://wa.me/5511925125435?text=')).toBe(true);
    expect(new URL(link).searchParams.get('text')).toBe(message);
  });

  it('a pergunta não encontrada entra no texto da mensagem', () => {
    expect(buildQuestionMessage('tem estacionamento?')).toBe(
      'Olá, Rosimaq! Vim pelo site e tenho uma dúvida: tem estacionamento?',
    );
  });
});
