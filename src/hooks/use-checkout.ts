import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { checkout } from "@/api/orders.api";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { CheckoutPayload } from "@/types";

import { orderKeys } from "./useOrders";

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const {
    getSelectedItems,
    getSummary,
    deliveryAddress,
    paymentMethod,
    setPlacedOrderId,
    setCheckoutStep,
    clearCart,
  } = useCartStore();

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("You must be logged in to place an order");
      if (!deliveryAddress || !paymentMethod) {
        throw new Error("Missing delivery address or payment method");
      }

      const items = getSelectedItems();
      const summary = getSummary();

      const payload: CheckoutPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.subtotal,
        })),
        deliveryAddress,
        paymentMethod,
        totalAmount: summary.total,
        currency: "UGX",
      };

      return checkout(payload, token);
    },

    onSuccess: (order) => {
      setPlacedOrderId(order.id);
      clearCart();
      queryClient.invalidateQueries({ queryKey: orderKeys.all() });

      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
      } else {
        setCheckoutStep("confirmation");
        navigate({
          to: "/checkout/confirmation",
          search: { orderId: order.id, status: "success" },
        });
      }
    },
  });
}
