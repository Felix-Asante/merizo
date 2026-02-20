import type { GroupTypeOption, CurrencyOption } from "./types";

export const GROUP_TYPES: GroupTypeOption[] = [
  { value: "home", label: "Home", emoji: "🏠" },
  { value: "trip", label: "Trip", emoji: "✈️" },
  { value: "couple", label: "Couple", emoji: "💑" },
  { value: "friends", label: "Friends", emoji: "👥" },
  { value: "other", label: "Other", emoji: "📦" },
];

export const CURRENCIES: CurrencyOption[] = [
  { code: "MAD", symbol: "MAD", name: "Moroccan Dirham" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
];
