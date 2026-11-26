import { company } from '../data/company';

export const GENERAL_MESSAGE = 'Olá, Rosimaq! Vim pelo site e gostaria de um orçamento de locação.';

export function equipmentMessage(equipmentName: string): string {
  return `Olá, Rosimaq! Vim pelo site e tenho interesse em locar: ${equipmentName}. Pode me passar valores e disponibilidade?`;
}

/** Monta o link wa.me com mensagem pré-preenchida. Função pura. */
export function buildWhatsAppLink(message: string = GENERAL_MESSAGE): string {
  return `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`;
}
