'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppState, Load, Quote } from './types';
import { createInitialState } from './data';

interface StoreContextType {
  state: AppState;
  startSourcing: () => void;
  addQuotes: (quotes: Quote[]) => void;
  updateLoadStatus: (loadId: string, status: Load['status']) => void;
  setError: (error: string | null) => void;
  resetSourcing: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState());

  const startSourcing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSourcing: true,
      currentRound: 1,
      error: null,
      loads: prev.loads.map((l) =>
        l.id === prev.activeLoadId ? { ...l, status: 'sourcing' as const } : l
      ),
    }));
  }, []);

  const addQuotes = useCallback((quotes: Quote[]) => {
    setState((prev) => ({
      ...prev,
      quotes: [...prev.quotes, ...quotes],
      isSourcing: false,
      currentRound: 1,
      loads: prev.loads.map((l) =>
        l.id === prev.activeLoadId ? { ...l, status: 'quoted' as const } : l
      ),
    }));
  }, []);

  const updateLoadStatus = useCallback((loadId: string, status: Load['status']) => {
    setState((prev) => ({
      ...prev,
      loads: prev.loads.map((l) => (l.id === loadId ? { ...l, status } : l)),
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
      isSourcing: false,
    }));
  }, []);

  const resetSourcing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSourcing: false,
      currentRound: 0,
      error: null,
    }));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        state,
        startSourcing,
        addQuotes,
        updateLoadStatus,
        setError,
        resetSourcing,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
