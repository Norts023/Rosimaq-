import { describe, expect, it } from 'vitest';
import {
  cleanInput,
  matchEquipment,
  matchIntent,
  normalizeText,
  parseDayMonth,
} from '../../src/lib/rosi/intents';
import { equipment } from '../../src/data/equipment';

describe('normalizeText', () => {
  it('remove acentos, põe em minúsculas e tira pontuação', () => {
    expect(normalizeText('  Qual o HORÁRIO de domingo?!  ')).toBe('qual o horario de domingo');
  });
});

describe('matchIntent', () => {
  it('reconhece horário, endereço e preço', () => {
    expect(matchIntent('qual o horário de domingo?')).toBe('horario');
    expect(matchIntent('onde fica a locadora')).toBe('endereco');
    expect(matchIntent('quanto custa a diária?')).toBe('preco');
  });
  it('reconhece pedido de pessoa e voltagem', () => {
    expect(matchIntent('quero falar com um atendente')).toBe('pessoa');
    expect(matchIntent('essa betoneira é 220?')).toBe('voltagem');
  });
  it('devolve null quando nada combina', () => {
    expect(matchIntent('bananas e chocolate')).toBeNull();
  });
});

describe('matchEquipment', () => {
  const ids = equipment.map((item) => item.id);
  it('acha equipamentos pelos apelidos', () => {
    expect(matchEquipment('preciso de uma britadeira', ids)).toBe('martelete-rompedor-5kg');
    expect(matchEquipment('furar parede com broca', ids)).toBe('martelete-perfurador-5kg');
    expect(matchEquipment('um misturador de concreto', ids)).toBe('betoneira-400l');
  });
  it('não confunde palavras parecidas dentro de outras', () => {
    expect(matchEquipment('pedi uma escadaria', ids)).toBeNull();
  });
});

describe('parseDayMonth', () => {
  const today = new Date(2026, 10, 26);
  it('aceita datas futuras no formato DD/MM', () => {
    expect(parseDayMonth('5/12', today)).toBe('05/12');
    expect(parseDayMonth('26/11', today)).toBe('26/11');
  });
  it('rejeita datas passadas, inexistentes e formatos errados', () => {
    expect(parseDayMonth('25/11', today)).toBeNull();
    expect(parseDayMonth('31/02', today)).toBeNull();
    expect(parseDayMonth('2026-12-05', today)).toBeNull();
  });
});

describe('cleanInput', () => {
  it('colapsa espaços e corta no limite, sem interpretar HTML', () => {
    expect(cleanInput('  oi   <b>x</b>  ', 50)).toBe('oi <b>x</b>');
    expect(cleanInput('abcdef', 3)).toBe('abc');
  });
});
