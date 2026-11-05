export type Kind = 'income' | 'expense';
export type Currency = 'ARS' | 'USD';
export type PaymentMethod = 'cash' | 'debit_card' | 'credit_card' | 'transfer' | 'other';
export type CreditCard = 'visa' | 'amex' | 'mercado_pago' | 'other';

export type Movement = {
  id: number;
  kind: Kind;
  date: string;
  description: string;
  amount: string;
  currency: Currency;
  category_id: number | null;
  category: string | null;
  subcategory: string | null;
  event_id: number | null;
  payment_method: PaymentMethod | null;
  credit_card: CreditCard | null;
  beneficiary: string | null;
  notes: string | null;
  shared: boolean;
};

export type MovementInput = Partial<Omit<Movement, 'id' | 'category' | 'subcategory' | 'amount'>> & {
  amount?: number;
};

export type Category = {
  id: number;
  name: string;
  kind: Kind;
  parent_id: number | null;
};
