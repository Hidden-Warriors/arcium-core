/**
 * @jest-environment node
 */

import {
  generateKeyPair,
  encryptWarriorStats,
  generateNonce,
  generateComputationOffset,
  validateWarriorStats,
  simulateArciumBattleResult,
  ArciumError,
  ArciumErrorType,
  WarriorStats,
} from '../src';
import { createMockProvider, createMockProgram } from './setup';

describe('@hidden-warrior/arcium-core', () => {
  describe('Key Generation', () => {
    test('should generate valid key pair', () => {
      const keyPair = generateKeyPair();

      expect(keyPair).toHaveProperty('privateKey');
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey.length).toBe(32);
      expect(keyPair.publicKey.length).toBe(32);
    });

    test('should generate different keys on each call', () => {
      const keyPair1 = generateKeyPair();
      const keyPair2 = generateKeyPair();

      expect(keyPair1.privateKey).not.toEqual(keyPair2.privateKey);
      expect(keyPair1.publicKey).not.toEqual(keyPair2.publicKey);
    });
  });

  describe('Nonce Generation', () => {
    test('should generate nonce of correct length', () => {
      const nonce16 = generateNonce(16);
      const nonce32 = generateNonce(32);

      expect(nonce16).toBeInstanceOf(Uint8Array);
      expect(nonce32).toBeInstanceOf(Uint8Array);
      expect(nonce16.length).toBe(16);
      expect(nonce32.length).toBe(32);
    });

    test('should generate different nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();

      expect(nonce1).not.toEqual(nonce2);
    });
  });

  describe('Computation Offset', () => {
    test('should generate valid computation offset', () => {
      const offset1 = generateComputationOffset();
      const offset2 = generateComputationOffset();

      expect(offset1).toBeDefined();
      expect(offset2).toBeDefined();
      expect(offset1.toString()).not.toEqual(offset2.toString());
    });

    test('should generate offset with custom length', () => {
      const offset = generateComputationOffset(16);
      expect(offset).toBeDefined();
    });
  });

  describe('Warrior Stats Validation', () => {
    test('should validate correct warrior stats', () => {
      const validStats: WarriorStats = {
        strength: 85,
        agility: 70,
        endurance: 90,
        intelligence: 75,
      };

      expect(() => validateWarriorStats(validStats)).not.toThrow();
    });

    test('should reject negative stats', () => {
      const invalidStats: WarriorStats = {
        strength: -5,
        agility: 70,
        endurance: 90,
        intelligence: 75,
      };

      expect(() => validateWarriorStats(invalidStats)).toThrow(ArciumError);
      expect(() => validateWarriorStats(invalidStats)).toThrow(
        'Strength must be a number between 0 and 100'
      );
    });

    test('should reject stats over 100', () => {
      const invalidStats: WarriorStats = {
        strength: 85,
        agility: 70,
        endurance: 150,
        intelligence: 75,
      };

      expect(() => validateWarriorStats(invalidStats)).toThrow(ArciumError);
      expect(() => validateWarriorStats(invalidStats)).toThrow(
        'Endurance must be a number between 0 and 100'
      );
    });

    test('should reject non-numeric stats', () => {
      const invalidStats = {
        strength: '85' as any,
        agility: 70,
        endurance: 90,
        intelligence: 75,
      };

      expect(() => validateWarriorStats(invalidStats)).toThrow(ArciumError);
    });
  });

  describe('Battle Simulation', () => {
    test('should simulate battle result', async () => {
      const result = await simulateArciumBattleResult(85, 100);

      expect(result).toHaveProperty('outcome');
      expect(result).toHaveProperty('proof');
      expect(result).toHaveProperty('opponent');
      expect(['Victory', 'Defeat', 'Draw']).toContain(result.outcome);
      expect(typeof result.proof).toBe('string');
      expect(result.opponent).toHaveProperty('name');
      expect(result.opponent).toHaveProperty('strength');
      expect(typeof result.opponent.strength).toBe('number');
      expect(result.opponent.strength).toBeGreaterThanOrEqual(40);
      expect(result.opponent.strength).toBeLessThanOrEqual(100);
    }, 5000);

    test('should simulate multiple battles', async () => {
      const promises = Array(10).fill(null).map(() =>
        simulateArciumBattleResult(85, 50)
      );
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(['Victory', 'Defeat', 'Draw']).toContain(result.outcome);
        expect(result.opponent.strength).toBeGreaterThanOrEqual(40);
      });
    }, 10000);
  });

  describe('Error Handling', () => {
    test('should create ArciumError with correct type', () => {
      const error = new ArciumError(
        ArciumErrorType.INVALID_INPUT,
        'Test error message'
      );

      expect(error).toBeInstanceOf(ArciumError);
      expect(error.type).toBe(ArciumErrorType.INVALID_INPUT);
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('ArciumError');
    });

    test('should handle original error', () => {
      const originalError = new Error('Original error');
      const error = new ArciumError(
        ArciumErrorType.ENCRYPTION_FAILED,
        'Encryption failed',
        originalError
      );

      expect(error.originalError).toBe(originalError);
    });

    test('should have correct error types', () => {
      expect(ArciumErrorType.MXE_CONNECTION_FAILED).toBe('MXE_CONNECTION_FAILED');
      expect(ArciumErrorType.ENCRYPTION_FAILED).toBe('ENCRYPTION_FAILED');
      expect(ArciumErrorType.KEY_GENERATION_FAILED).toBe('KEY_GENERATION_FAILED');
      expect(ArciumErrorType.ACCOUNT_DERIVATION_FAILED).toBe('ACCOUNT_DERIVATION_FAILED');
      expect(ArciumErrorType.INVALID_INPUT).toBe('INVALID_INPUT');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete workflow simulation', async () => {
      // This is a simulation of the complete workflow
      // In real tests, you'd use actual Solana/mock provider

      const mockProvider = createMockProvider();
      const mockProgram = createMockProgram();

      // Test that our utilities work together
      const keyPair = generateKeyPair();
      const nonce = generateNonce();
      const computationOffset = generateComputationOffset();

      expect(keyPair).toBeDefined();
      expect(nonce).toBeDefined();
      expect(computationOffset).toBeDefined();

      // Test warrior validation
      const warriorStats: WarriorStats = {
        strength: 75,
        agility: 65,
        endurance: 80,
        intelligence: 70,
      };

      expect(() => validateWarriorStats(warriorStats)).not.toThrow();

      // Simulate battle
      const battleResult = await simulateArciumBattleResult(75, 100);
      expect(battleResult).toHaveProperty('outcome');

    }, 5000);
  });

  describe('Performance Tests', () => {
    test('should handle multiple key generations quickly', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const keyPair = generateKeyPair();
        expect(keyPair).toBeDefined();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 100 key generations in under 1 second
      expect(duration).toBeLessThan(1000);
    });

    test('should handle multiple nonce generations quickly', () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        const nonce = generateNonce();
        expect(nonce.length).toBe(16);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 1000 nonce generations in under 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Edge Cases', () => {
    test('should handle extreme warrior stats', () => {
      const minStats: WarriorStats = {
        strength: 0,
        agility: 0,
        endurance: 0,
        intelligence: 0,
      };

      const maxStats: WarriorStats = {
        strength: 100,
        agility: 100,
        endurance: 100,
        intelligence: 100,
      };

      expect(() => validateWarriorStats(minStats)).not.toThrow();
      expect(() => validateWarriorStats(maxStats)).not.toThrow();
    });

    test('should handle zero delay battle simulation', async () => {
      const result = await simulateArciumBattleResult(50, 0);
      expect(result).toHaveProperty('outcome');
      expect(['Victory', 'Defeat', 'Draw']).toContain(result.outcome);
    });

    test('should handle large delay battle simulation', async () => {
      const result = await simulateArciumBattleResult(50, 100);
      expect(result).toHaveProperty('outcome');
      expect(['Victory', 'Defeat', 'Draw']).toContain(result.outcome);
    }, 5000);
  });
});
