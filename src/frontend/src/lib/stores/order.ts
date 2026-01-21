import { writable } from "svelte/store";

export type OrderStage = "menu" | "pricing";

export interface OrderState {
  stage: OrderStage;
  summary: string | null;
}

function createOrderStore() {
  const { subscribe, set, update } = writable<OrderState>({
    stage: "menu",
    summary: null,
  });

  return {
    subscribe,
    reset() {
      set({ stage: "menu", summary: null });
    },
    showMenu() {
      update((state) => ({ ...state, stage: "menu" }));
    },
    showPricing(summary?: string) {
      set({ stage: "pricing", summary: summary ?? null });
    },
  };
}

export const orderState = createOrderStore();
