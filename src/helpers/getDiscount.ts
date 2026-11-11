
import { SBCoupon } from "@/services/coupons/types";
import { SBOrder } from "@/services/orders/types";

type Props = {
  coupon: Pick<SBCoupon, "discount_type" | "discount_value"> | null;
  totalAmount: SBOrder["total_amount"];
  shippingCost: number;
};

export function getDiscount({
  coupon,
  totalAmount,
  shippingCost,
}: Props) {
  if (!coupon) return "0.00";

  const subtotal = Math.max(0, totalAmount - shippingCost);

  if (coupon.discount_type === "fixed") {
    return Math.min(coupon.discount_value, subtotal).toFixed(2);
  }

  const percentage = Math.min(coupon.discount_value, 100);
  const calculatedDiscount = subtotal * (percentage / 100);

  return calculatedDiscount.toFixed(2);
}
