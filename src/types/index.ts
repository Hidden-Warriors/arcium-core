/**
 * @packageDocumentation
 * @module @hidden-warrior/arcium-core
 */

import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

/**
 * Base interface for any data that can be encrypted with Arcium
 */
export interface EncryptableData {
  /** Convert to BigInt for encryption */
  toBigInt(): bigint;
}

/**
 * Generic warrior stats interface
 * Can be extended for different game implementations
 */
export interface WarriorStats {
  strength: number;
  agility: number;
  endurance: number;
  intelligence: number;
}

/**
 * Arcium encryption key pair
 */
export interface ArciumKeyPair {
  /** Private key for encryption/decryption */
  privateKey: Uint8Array;
  /** Public key for key exchange */
  publicKey: Uint8Array;
}

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Encrypted data components */
  encryptedData: Uint8Array[];
  /** Nonce used for encryption */
  nonce: Uint8Array;
  /** Public key used for encryption */
  publicKey: Uint8Array;
}

/**
 * Arcium account addresses
 */
export interface ArciumAccounts {
  /** MXE (Multi-party Execution Environment) account */
  mxeAccount: PublicKey;
  /** Mempool account for transaction queuing */
  mempoolAccount: PublicKey;
  /** Execution pool account */
  executingPool: PublicKey;
  /** Computation account for this specific operation */
  computationAccount: PublicKey;
  /** Computation definition account */
  compDefAccount: PublicKey;
  /** Cluster account for distributed computation */
  clusterAccount: PublicKey;
  /** Main pool account */
  poolAccount: PublicKey;
  /** Clock account for timing */
  clockAccount: PublicKey;
  /** Battle result PDA */
  battleResult: PublicKey;
  /** System program ID */
  systemProgram: PublicKey;
  /** Arcium program ID */
  arciumProgram: PublicKey;
}

/**
 * Arguments for Arcium battle preparation
 */
export interface ArciumBattleArgs {
  /** Computation offset for uniqueness */
  computationOffset: anchor.BN;
  /** Encrypted warrior statistics */
  warriorStats: Uint8Array;
  /** Client public key */
  pubKey: Uint8Array;
  /** Nonce for encryption */
  nonce: anchor.BN;
}

/**
 * Complete Arcium preparation result
 */
export interface ArciumPreparationResult {
  /** Arguments for the Arcium transaction */
  args: ArciumBattleArgs;
  /** All required account addresses */
  accounts: ArciumAccounts;
}

/**
 * Configuration for Arcium operations
 */
export interface ArciumConfig {
  /** Maximum number of retries for MXE operations */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelayMs?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Error types for Arcium operations
 */
export enum ArciumErrorType {
  MXE_CONNECTION_FAILED = 'MXE_CONNECTION_FAILED',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  KEY_GENERATION_FAILED = 'KEY_GENERATION_FAILED',
  ACCOUNT_DERIVATION_FAILED = 'ACCOUNT_DERIVATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
}

/**
 * Custom error class for Arcium operations
 */
export class ArciumError extends Error {
  constructor(
    public type: ArciumErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ArciumError';
  }
}

/**
 * Result of MXE public key retrieval
 */
export interface MXEPublicKeyResult {
  /** The MXE public key */
  publicKey: Uint8Array;
  /** Number of attempts made */
  attempts: number;
}

/**
 * Mock opponent for testing/simulated battles
 */
export interface MockOpponent {
  /** Opponent name */
  name: string;
  /** Opponent strength */
  strength: number;
  /** Opponent image URL */
  image: string;
}

/**
 * Mock battle result for testing
 */
export interface MockBattleResult {
  /** Battle outcome */
  outcome: 'Victory' | 'Defeat' | 'Draw';
  /** Cryptographic proof */
  proof: string;
  /** Additional details */
  details?: string;
  /** Opponent information */
  opponent?: MockOpponent;
}
