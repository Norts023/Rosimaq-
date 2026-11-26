// Fonte única do catálogo. As imagens (astro:assets) são ligadas na etapa 5,
// quando os arquivos de src/assets/equipment/ estiverem no repositório.
export type CategorySlug =
  'concreto' | 'demolicao-perfuracao' | 'altura-acesso' | 'eletrica' | 'pintura';

export interface Category {
  slug: CategorySlug;
  label: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: CategorySlug;
  description: string;
  specs: string[];
  featured: boolean;
  /** Nome do arquivo esperado em src/assets/equipment/ */
  photoFile: string;
}

export const categories: readonly Category[] = [
  { slug: 'concreto', label: 'Concreto e argamassa' },
  { slug: 'demolicao-perfuracao', label: 'Demolição e perfuração' },
  { slug: 'altura-acesso', label: 'Altura e acesso' },
  { slug: 'eletrica', label: 'Energia e elétrica' },
  { slug: 'pintura', label: 'Pintura' },
] as const;

export const equipment: readonly Equipment[] = [
  {
    id: 'betoneira-400l',
    name: 'Betoneira 400 L',
    category: 'concreto',
    description: 'Betoneira para misturar concreto e argamassa em obras de médio e grande porte.',
    specs: ['400 litros', '220 V monofásica', 'Menegotti Prime 400'],
    featured: true,
    photoFile: '01_Betoneira_Menegotti_Prime_400L_220V.jpg',
  },
  {
    id: 'martelete-rompedor-5kg',
    name: 'Martelete rompedor 5 kg',
    category: 'demolicao-perfuracao',
    description: 'Martelete para demolição de concreto, alvenaria e pisos.',
    specs: ['5 kg', '1300 W', '220 V', 'Arita 732X'],
    featured: true,
    photoFile: '02_Martelete_Rompedor_Arita_5kg_1300W_220V.jpg',
  },
  {
    id: 'martelete-perfurador-5kg',
    name: 'Martelete perfurador 5 kg',
    category: 'demolicao-perfuracao',
    description:
      'Martelete para perfurar concreto e alvenaria com brocas SDS, com opção de impacto.',
    specs: ['5 kg', '1600 W', '220 V', 'SDS rotativo'],
    featured: false,
    photoFile: '03_Martelete_Perfurador_5kg_1600W_220V.jpg',
  },
  {
    id: 'vibrador-concreto-1-2m',
    name: 'Vibrador de concreto com mangote 1,2 m',
    category: 'concreto',
    description:
      'Vibrador de imersão para adensar o concreto fresco, eliminando bolhas de ar e melhorando o acabamento.',
    specs: ['1000 W', '220 V', 'mangote 1,2 m'],
    featured: false,
    photoFile: '04_Vibrador_Concreto_com_Mangote_Menegotti_1000W_220V.jpg',
  },
  {
    id: 'vibrador-concreto-35mm',
    name: 'Vibrador de concreto com mangote 35 mm',
    category: 'concreto',
    description: 'Vibrador de imersão para peças de maior extensão ou profundidade.',
    specs: ['1000 W', '220 V', 'mangote 35 mm x 2,5 m', 'Menegotti'],
    featured: true,
    photoFile: '05_Vibrador_Concreto_com_Mangote_35mm_2,5m_Menegotti_1000W_220V.jpg',
  },
  {
    id: 'andaime-1x1',
    name: 'Andaime profissional de aço 1,00 x 1,00',
    category: 'altura-acesso',
    description: 'Módulo de andaime de aço para trabalhos em altura.',
    specs: ['1,00 x 1,00 m', 'aço', 'NR18'],
    featured: true,
    photoFile: '06_Andaime_Profissional_Aco_1,00x1,00_NR18.jpg',
  },
  {
    id: 'andaime-1x1-5',
    name: 'Andaime profissional de aço 1,00 x 1,50',
    category: 'altura-acesso',
    description: 'Módulo de andaime de aço para trabalhos em altura.',
    specs: ['1,00 x 1,50 m', 'aço', 'NR18'],
    featured: false,
    photoFile: '07_Andaime_Profissional_Aco_1,00x1,50_NR18.jpg',
  },
  {
    id: 'extensao-50m',
    name: 'Extensão elétrica 50 m',
    category: 'eletrica',
    description: 'Extensão para ligar equipamentos distantes da fonte de energia na obra.',
    specs: ['50 m', '20 A', 'cabo PP 2x1,5 mm'],
    featured: false,
    photoFile: '08_Extensao_Eletrica_50m_20A_Cabo_PP_2x1,5.jpg',
  },
  {
    id: 'corda-bombeiro-12mm',
    name: 'Corda de bombeiro 12 mm',
    category: 'altura-acesso',
    description: 'Corda para estaiamento de andaime.',
    specs: ['50 m', '12 mm', 'NR18'],
    featured: false,
    photoFile: '09_Corda_Bombeiro_50m_12mm_NR18_Estaiamento.jpg',
  },
  {
    id: 'escada-fibra-25-degraus',
    name: 'Escada extensível de fibra de vidro, 25 degraus',
    category: 'altura-acesso',
    description:
      'Escada extensível para trabalhos em altura. A fibra de vidro não conduz eletricidade.',
    specs: ['25 degraus', '4,50 a 7,80 m'],
    featured: false,
    photoFile: '10_Escada_Extensivel_Fibra_Vidro_25_Degraus_4,50_a_7,80m.jpg',
  },
  {
    id: 'escada-degrau-d-vazada',
    name: 'Escada extensiva em D vazada',
    category: 'altura-acesso',
    description: 'Escada extensiva com degraus em D vazados, para acesso a pontos elevados.',
    specs: ['fechada 3,60 m', 'estendida 6,00 m'],
    featured: false,
    photoFile: '11_Escada_Extensiva_Degraus_em_D_Vazada_3,60_a_6,00m.jpg',
  },
  {
    id: 'escada-aluminio-fibra-27-degraus',
    name: 'Escada de alumínio e fibra de vidro, 27 degraus',
    category: 'altura-acesso',
    description: 'Escada extensível com estrutura mista de alumínio e fibra de vidro.',
    specs: ['27 degraus', '8,4 m'],
    featured: false,
    photoFile: '12_Escada_Aluminio_Fibra_Vidro_Extensivel_8,4m_27_Degraus.jpg',
  },
  {
    id: 'maquina-pintura',
    name: 'Máquina de pintura',
    category: 'pintura',
    description: 'Máquina para aplicar tinta com rapidez em paredes e grandes superfícies.',
    specs: ['Menegotti', 'mangueira e pistola'],
    featured: false,
    photoFile: '13_Maquina_de_Pintura_Menegotti.jpg',
  },
] as const;

export const featuredEquipment = equipment.filter((item) => item.featured);

export function getEquipmentById(id: string): Equipment | undefined {
  return equipment.find((item) => item.id === id);
}

export function getCategoryLabel(slug: CategorySlug): string {
  return categories.find((category) => category.slug === slug)?.label ?? slug;
}
