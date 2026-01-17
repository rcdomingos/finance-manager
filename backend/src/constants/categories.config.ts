export type CategoryConfig = {
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  subcategories: string[];
};

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    name: 'Renda',
    type: 'INCOME',
    subcategories: ['Auxílios', 'Salários e Bônus', 'Vale Alimentação', 'Renda Extra'],
  },
  {
    name: 'Transporte',
    type: 'EXPENSE',
    subcategories: [
      'Combustível',
      'Manutenção do Carro',
      'Transporte Público',
      'Estacionamento e Pedágio',
      'Aplicativos de Mobilidade',
    ],
  },
  {
    name: 'Compras e Lazer',
    type: 'EXPENSE',
    subcategories: [
      'Coisas para Casa',
      'Eletrônicos',
      'Festas e Encontros',
      'Jogos',
      'Pets',
      'Presentes',
      'Roupas e Acessórios',
    ],
  },
  {
    name: 'Emergências',
    type: 'EXPENSE',
    subcategories: ['Despesas Emergenciais'],
  },
  {
    name: 'Impostos e Taxas',
    type: 'EXPENSE',
    subcategories: ['IPTU', 'IPVA', 'IR', 'Licenciamento', 'Multa'],
  },
  {
    name: 'Educação e Desenvolvimento',
    type: 'EXPENSE',
    subcategories: ['Livros e Materiais', 'Cursos e Treinamentos'],
  },
  {
    name: 'Empréstimos',
    type: 'EXPENSE',
    subcategories: ['Cartão de Crédito', 'Financiamento'],
  },
  {
    name: 'Alimentação',
    type: 'EXPENSE',
    subcategories: ['Restaurante ou Delivery', 'Supermercados'],
  },
  {
    name: 'Assinaturas',
    type: 'EXPENSE',
    subcategories: ['Aplicativos', 'Serviços Digitais', 'Streamings', 'Plano Celular'],
  },
  {
    name: 'Moradia',
    type: 'EXPENSE',
    subcategories: [
      'Condomínio',
      'Financiamento',
      'Gás',
      'Internet e Telefone',
      'Luz',
      'Reformas e Melhorias',
    ],
  },
  {
    name: 'Saúde e Bem-Estar',
    type: 'EXPENSE',
    subcategories: [
      'Suplementos',
      'Academia e Fitness',
      'Consultas e Tratamentos',
      'Farmácia e Medicamentos',
      'Planos de Saúde',
    ],
  },
  {
    name: 'Poupança',
    type: 'EXPENSE', // Tratado como saída de caixa (saving)
    subcategories: ['Reserva de Emergência', 'Reserva de Curto Prazo'],
  },
  {
    name: 'Investimentos',
    type: 'EXPENSE', // Tratado como saída de caixa (investment)
    subcategories: ['Renda Fixa', 'Projeto Finclass'],
  },
  {
    name: 'Transferências e Pagamentos',
    type: 'TRANSFER', // Tipo especial para movimentação interna
    subcategories: [
      'Cartão de Crédito', // Pagamento da fatura
      'Transferências entre Contas',
      'Transferências para Outras Pessoas',
    ],
  },
  {
    name: 'Seguros',
    type: 'EXPENSE',
    subcategories: ['Seguro de Automóvel', 'Seguro de Vida', 'Seguro Residencial'],
  },
  {
    name: 'Manutenção e Reparos',
    type: 'EXPENSE',
    subcategories: ['Reparos de Eletrodomésticos', 'Reparos da Casa', 'Serviços de Limpeza'],
  },
  {
    name: 'Viagem',
    type: 'EXPENSE',
    subcategories: [
      'Passeios e Lazer',
      'Hospedagem',
      'Passagens e Transportes',
      'Alimentação em Viagem',
    ],
  },
];
