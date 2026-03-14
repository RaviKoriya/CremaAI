"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface CurrencyContextValue {
  currency: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
});

export function CurrencyProvider({
  initialCurrency,
  children,
}: {
  initialCurrency: string;
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState(() => {
    // On server, use the DB value. On client, prefer localStorage if set.
    if (typeof window !== "undefined") {
      return localStorage.getItem("app_currency") ?? initialCurrency;
    }
    return initialCurrency;
  });

  // Sync localStorage → state on first mount (handles server-rendered mismatch)
  useEffect(() => {
    const stored = localStorage.getItem("app_currency");
    if (stored && stored !== currency) {
      setCurrencyState(stored);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setCurrency(c: string) {
    setCurrencyState(c);
    localStorage.setItem("app_currency", c);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
