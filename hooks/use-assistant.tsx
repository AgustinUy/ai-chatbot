'use client';

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { Assistant } from '../lib/db/schema';

interface AssistantContextType {
  selectedAssistant: Assistant | null;
  selectAssistant: (assistant: Assistant | null) => void;
  clearSelection: () => void;
}

const AssistantContext = createContext<AssistantContextType>({
  selectedAssistant: null,
  selectAssistant: () => {},
  clearSelection: () => {},
});

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);

  // Load selected assistant from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedAssistant');
    if (stored) {
      try {
        const assistant = JSON.parse(stored);
        setSelectedAssistant(assistant);
      } catch (error) {
        console.error('Error parsing stored assistant:', error);
        localStorage.removeItem('selectedAssistant');
      }
    }
  }, []);

  const selectAssistant = (assistant: Assistant | null) => {
    setSelectedAssistant(assistant);
    if (assistant) {
      localStorage.setItem('selectedAssistant', JSON.stringify(assistant));
    } else {
      localStorage.removeItem('selectedAssistant');
    }
  };

  const clearSelection = () => {
    setSelectedAssistant(null);
    localStorage.removeItem('selectedAssistant');
  };

  return (
    <AssistantContext.Provider value={{ selectedAssistant, selectAssistant, clearSelection }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}
