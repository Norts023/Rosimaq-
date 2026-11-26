import { describe, expect, it } from 'vitest';
import { GENERAL_MESSAGE, buildWhatsAppLink, equipmentMessage } from '../../src/lib/whatsapp';

describe('buildWhatsAppLink', () => {
  it('usa o número oficial e codifica a mensagem geral', () => {
    const link = buildWhatsAppLink();
    expect(link.startsWith('https://wa.me/5511925125435?text=')).toBe(true);
    expect(link).toContain(encodeURIComponent(GENERAL_MESSAGE));
  });

  it('codifica acentos e quebras de linha', () => {
    const link = buildWhatsAppLink('Locação\nde água & ação');
    const text = new URL(link).searchParams.get('text');
    expect(text).toBe('Locação\nde água & ação');
    expect(link).not.toContain('\n');
    expect(link).not.toContain(' ');
  });

  it('monta a mensagem de equipamento com o nome', () => {
    const link = buildWhatsAppLink(equipmentMessage('Betoneira 400 L'));
    const text = new URL(link).searchParams.get('text');
    expect(text).toContain('tenho interesse em locar: Betoneira 400 L.');
  });
});
