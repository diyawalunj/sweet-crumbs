export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const CATEGORIES = {
  income: [
    'Pastry Sales',
    'Custom Cakes',
    'Workshop',
    'Catering',
    'Other Income'
  ],
  expense: [
    'Ingredients',
    'Packaging',
    'Equipment',
    'Rent & Utilities',
    'Marketing',
    'Staff',
    'Other Expense'
  ]
};
