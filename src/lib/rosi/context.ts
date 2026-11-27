/** Monta o contexto da Rosi a partir dos dados da empresa e dos equipamentos (fonte única). */
import { company } from '../../data/company';
import { equipment } from '../../data/equipment';
import { getOpenStatus } from '../openStatus';
import type { RosiContext } from './engine';

export function buildContext(now: Date = new Date()): RosiContext {
  const status = getOpenStatus(now);
  const { address } = company;
  const fullAddress = `${address.street}, ${address.complement}, ${address.district}, ${address.city} - ${address.state}, ${address.zip}`;
  return {
    equipment,
    cities: company.serviceArea,
    isOpen: status.isOpen,
    statusLabel: status.label,
    mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
    instagram: company.instagram,
    phone: company.phoneDisplay,
    email: company.email,
    hoursText: company.hours.days.toLowerCase(),
    addressText: `${address.street}, ${address.complement}, ${address.district}, ${address.city} · ${address.state}`,
    today: now,
  };
}
