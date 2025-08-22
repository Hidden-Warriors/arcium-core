/**
 * Jest setup file
 * Configures the testing environment for @hidden-warrior/arcium-core
 */

import { jest } from '@jest/globals';

// Mock crypto for browser compatibility
import crypto from 'crypto';

// Add crypto polyfill for Node.js environment
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => crypto.randomFillSync(arr),
  },
});

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Keep error and warn for debugging
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Set up test environment variables
process.env.NODE_ENV = 'test';

// Export common test utilities
export const createMockProvider = () => ({
  connection: {
    getLatestBlockhash: jest.fn().mockResolvedValue({
      blockhash: '11111111111111111111111111111111',
    }),
  },
  wallet: {
    publicKey: {
      toString: () => '11111111111111111111111111111111',
    },
    signTransaction: jest.fn(),
  },
});

export const createMockProgram = () => ({
  programId: {
    toString: () => '11111111111111111111111111111111',
  },
  methods: {
    battleWarrior: jest.fn().mockReturnValue({
      accounts: jest.fn().mockReturnValue({
        transaction: jest.fn().mockResolvedValue({}),
      }),
    }),
  },
});
