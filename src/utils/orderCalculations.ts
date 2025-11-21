import type { ExtraFee } from '../types/restaurant';

export interface CalculatedFee {
  label: string;
  amount: number;
}

export interface OrderTotals {
  subtotal: number;
  extraFees: CalculatedFee[];
  deliveryFee: number;
  total: number;
}

/**
 * Calculate order totals including extra fees
 */
export function calculateOrderTotals(
  subtotal: number,
  extraFees: ExtraFee[] | null | undefined,
  deliveryFee: number
): OrderTotals {
  const fees: CalculatedFee[] = (extraFees || []).map((fee) => ({
    label: fee.label,
    amount: subtotal * (fee.percentage / 100),
  }));

  const totalExtraFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const total = subtotal + deliveryFee + totalExtraFees;

  return {
    subtotal,
    extraFees: fees,
    deliveryFee,
    total,
  };
}

