"use client";

import { createContext, useContext, useState } from "react";

const ReservationContext = createContext();

export default function ReservationProvider({ children }) {
  const [range, setRange] = useState({ from: undefined, to: undefined });

  function resetRange() {
    setRange({ from: undefined, to: undefined });
  }

  return (
    <ReservationContext.Provider value={{ range, setRange, resetRange }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }
  return context;
}
