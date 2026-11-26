import { describe, expect, it } from 'vitest';
import { getOpenStatus } from '../../src/lib/openStatus';

// São Paulo está em UTC-3 (sem horário de verão desde 2019).
const saoPaulo = (isoLocal: string) => new Date(`${isoLocal}-03:00`);

describe('getOpenStatus (America/Sao_Paulo)', () => {
  it('antes das 7h está fechado', () => {
    expect(getOpenStatus(saoPaulo('2026-11-26T06:59:59')).isOpen).toBe(false);
    expect(getOpenStatus(saoPaulo('2026-11-26T00:00:00')).label).toBe('Fechado · abre às 7h');
  });

  it('às 7h em ponto já está aberto', () => {
    expect(getOpenStatus(saoPaulo('2026-11-26T07:00:00'))).toEqual({
      isOpen: true,
      label: 'Aberto agora · até 22h',
    });
  });

  it('entre 7h e 22h está aberto', () => {
    expect(getOpenStatus(saoPaulo('2026-11-26T13:30:00')).isOpen).toBe(true);
    expect(getOpenStatus(saoPaulo('2026-11-26T21:59:59')).isOpen).toBe(true);
  });

  it('às 22h em ponto e depois está fechado', () => {
    expect(getOpenStatus(saoPaulo('2026-11-26T22:00:00')).isOpen).toBe(false);
    expect(getOpenStatus(saoPaulo('2026-11-26T23:45:00')).label).toBe('Fechado · abre às 7h');
  });

  it('respeita a virada do dia no fuso de São Paulo', () => {
    // 23:59 de 25/11 e 00:00 de 26/11 em Brasília, ambos fora do horário.
    expect(getOpenStatus(saoPaulo('2026-11-25T23:59:00')).isOpen).toBe(false);
    expect(getOpenStatus(saoPaulo('2026-11-26T00:00:00')).isOpen).toBe(false);
    // 03:00 UTC de 26/11 é 00:00 em Brasília: ainda fechado.
    expect(getOpenStatus(new Date('2026-11-26T03:00:00Z')).isOpen).toBe(false);
  });

  it('usa o fuso de São Paulo mesmo quando o instante é UTC', () => {
    // 10:00 UTC = 07:00 em São Paulo: aberto.
    expect(getOpenStatus(new Date('2026-11-26T10:00:00Z')).isOpen).toBe(true);
    // 09:59 UTC = 06:59 em São Paulo: fechado.
    expect(getOpenStatus(new Date('2026-11-26T09:59:00Z')).isOpen).toBe(false);
  });
});
