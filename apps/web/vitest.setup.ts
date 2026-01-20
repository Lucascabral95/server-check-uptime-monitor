import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const errorString = args[0]?.toString() || '';
  if (
    errorString.includes('ZodError') ||
    errorString.includes('La contraseña es requerida') ||
    errorString.includes('La contraseña debe tener al menos')
  ) {
    return;
  }
  originalConsoleError(...args);
};

const unhandledRejections = new Set<PromiseRejectionEvent>();

globalThis.addEventListener('unhandledrejection', (event) => {
  const isZod = 
    event.reason?.issues || 
    event.reason?.name === 'ZodError' ||
    event.reason?.constructor?.name === 'ZodError';
  
  if (isZod) {
    unhandledRejections.add(event);
    event.preventDefault();
  }
});

afterEach(() => {
  unhandledRejections.clear();
});

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});