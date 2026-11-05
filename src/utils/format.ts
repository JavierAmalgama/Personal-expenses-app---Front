import type { CreditCard, Currency, Movement, PaymentMethod } from '@/api/types';

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const SYMBOLS: Record<Currency, string> = { ARS: '$', USD: 'US$ ' };

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  debit_card: 'Débito',
  credit_card: 'Tarjeta de crédito',
  transfer: 'Transferencia',
  other: 'Otro',
};

export const CREDIT_CARDS: Record<CreditCard, string> = {
  visa: 'Visa',
  amex: 'Amex',
  mercado_pago: 'Mercado Pago',
  other: 'Otra',
};

const pad = (n: number) => String(n).padStart(2, '0');

// Manual es-AR grouping: Intl locale data isn't guaranteed on every RN engine.
function groupThousands(value: number, decimals: number) {
  const [int, dec] = value.toFixed(decimals).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dec ? `${grouped},${dec}` : grouped;
}

export function fmtMoney(amount: number | string, currency: Currency = 'ARS') {
  const value = Math.abs(Number(amount) || 0);
  const decimals = Math.round(value * 100) % 100 === 0 ? 0 : 2;
  return `${Number(amount) < 0 ? '−' : ''}${SYMBOLS[currency]}${groupThousands(value, decimals)}`;
}

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const currentMonth = () => todayISO().slice(0, 7);

export function addMonths(month: string, n: number) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function monthLabel(month: string) {
  const [y, m] = month.split('-').map(Number);
  const name = MONTHS[m - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`;
}

export function fmtDate(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function paymentLabel(movement: Pick<Movement, 'payment_method' | 'credit_card'>) {
  if (movement.payment_method === 'credit_card' && movement.credit_card) return CREDIT_CARDS[movement.credit_card];
  return movement.payment_method ? PAYMENT_METHODS[movement.payment_method] : null;
}

// Totals are kept per currency: ARS and USD are never added together.
export function totalsByCurrency(movements: Movement[]) {
  const totals: Partial<Record<Currency, { income: number; expense: number }>> = {};
  for (const m of movements) {
    const t = (totals[m.currency] ??= { income: 0, expense: 0 });
    t[m.kind] += Number(m.amount);
  }
  return totals;
}
