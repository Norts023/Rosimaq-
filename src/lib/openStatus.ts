import { company } from '../data/company';

export interface OpenStatus {
  isOpen: boolean;
  label: string;
}

const openHour = Number(company.hours.open.split(':')[0]);
const closeHour = Number(company.hours.close.split(':')[0]);

const hourFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: company.hours.timezone,
  hour: 'numeric',
  hourCycle: 'h23',
});

/**
 * Estado de atendimento no fuso de São Paulo.
 * Aberto das 07:00 (inclusive) às 22:00 (exclusive).
 */
export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const hour = Number(hourFormatter.format(now)) % 24;
  const isOpen = hour >= openHour && hour < closeHour;
  return isOpen
    ? { isOpen: true, label: `Aberto agora · até ${closeHour}h` }
    : { isOpen: false, label: `Fechado · abre às ${openHour}h` };
}
