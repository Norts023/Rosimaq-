// Fonte única dos dados da empresa. Não repetir estes valores nos componentes.
export const company = {
  name: 'Rosimaq',
  legalName: 'ROSIMAQ LOCACAO DE EQUIPAMENTOS PARA CONSTRUCAO CIVIL LTDA',
  cnpj: '69.829.883/0001-43',
  tagline: 'Locação de equipamentos para construção civil',
  whatsapp: '5511925125435',
  phoneDisplay: '(11) 92512-5435',
  phoneHref: 'tel:+5511925125435',
  email: 'rosimaq.locacao@gmail.com',
  instagram: 'https://www.instagram.com/rosimaq',
  address: {
    street: 'Rua Piauí, 319',
    complement: 'Quadra 17, Lote 23A',
    district: 'Recanto Silvestre (Fazendinha)',
    city: 'Santana de Parnaíba',
    state: 'SP',
    zip: '06530-300',
  },
  hours: {
    days: 'Segunda a domingo',
    open: '07:00',
    close: '22:00',
    timezone: 'America/Sao_Paulo',
  },
  serviceArea: ['Santana de Parnaíba', 'Cajamar', 'Barueri', 'Pirapora do Bom Jesus', 'Itapevi'],
} as const;

export type Company = typeof company;
