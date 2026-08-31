'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppState, Load, Carrier, Quote, Booking } from './types';
import { createInitialState } from './data';

interface AppContextType {
  state: AppState;
  setActiveLoadId: (id: string | null) => void;
  setLoadStatus: (loadId: string, status: Load['status']) => void;
  setIsSourcing: (isSourcing: boolean) => void;
  setCurrentRound: (round: 0 | 1 | 2) => void;
  setError: (error: string | null) => void;
  addQuote: (quote: Quote) => void;
  addBooking: (booking: Booking) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState());

  const setActiveLoadId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, activeLoadId: id }));
  }, []);

  const setLoadStatus = useCallback((loadId: string, status: Load['status']) => {
    setState((prev) => ({
      ...prev,
      loads: prev.loads.map((load) =>
        load.id === loadId ? { ...load, status } : load
      ),
    }));
  }, []);

  const setIsSourcing = useCallback((isSourcing: boolean) => {
    setState((prev) => ({ ...prev, isSourcing }));
  }, []);

  const setCurrentRound = useCallback((round: 0 | 1 | 2) => {
    setState((prev) => ({ ...prev, currentRound: round }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const addQuote = useCallback((quote: Quote) => {
    setState((prev) => ({
      ...prev,
      quotes: [...prev.quotes, quote],
    }));
  }, []);

  const addBooking = useCallback((booking: Booking) => {
    setState((prev) => ({
      ...prev,
      bookings: [...prev.bookings, booking],
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        setActiveLoadId,
        setLoadStatus,
        setIsSourcing,
        setCurrentRound,
        setError,
        addQuote,
        addBooking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
