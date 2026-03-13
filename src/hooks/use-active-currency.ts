 "use client";

 import { CURRENCIES } from "@/config/constants";
 import { getActiveGroup } from "@/services/groups/groups-service-client";

 export function useActiveCurrency() {
   const { data: activeGroup } = getActiveGroup();

   const code = activeGroup?.currency ?? "USD";
   const currency = CURRENCIES.find((c) => c.code === code);
   const symbol = currency?.symbol ?? code;

   return { code, symbol };
 }

