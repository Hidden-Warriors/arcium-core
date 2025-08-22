/**
 * @packageDocumentation
 * @module @hidden-warrior/arcium-core
 *
 * Privacy-focused computation framework for Solana using Arcium technology.
 *
 * This package provides utilities for:
 * - Private data encryption using Rescue Cipher
 * - MXE (Multi-party Execution Environment) integration
 * - Account derivation for privacy-enabled programs
 * - Battle preparation with encrypted statistics
 * - Testing utilities and mock functions
 *
 * @example
 * ```typescript
 * import { prepareArciumBattle, encryptWarriorStats } from '@hidden-warrior/arcium-core';
 * import { Program, AnchorProvider } from '@coral-xyz/anchor';
 *
 * // Encrypt warrior statistics
 * const encryptedStats = encryptWarriorStats(
 *   { strength: 85, agility: 70, endurance: 90, intelligence: 75 },
 *   sharedSecret,
 *   nonce
 * );
 *
 * // Prepare battle with Arcium
 * const result = await prepareArciumBattle(program, provider, warriorStats, payerPubkey);
 * ```
 */

import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

// Export all types
export * from './types';

// Export all utilities
export * from './utils';

// Import types for internal use
import type { WarriorStats, ArciumConfig, ArciumPreparationResult } from './types';

// Re-export commonly used imports for convenience
export { AnchorProvider, Program } from '@coral-xyz/anchor';
export { PublicKey, SystemProgram } from '@solana/web3.js';

/**
 * Main function to prepare a battle with Arcium privacy system
 *
 * This is the primary entry point for integrating Arcium into your game.
 * It handles key generation, encryption, and account derivation.
 *
 * @param program - Anchor program instance
 * @param provider - Anchor provider
 * @param warriorStats - Warrior statistics to encrypt
 * @param payerPubkey - Public key of the transaction payer
 * @param config - Optional Arcium configuration
 * @returns Promise resolving to complete Arcium preparation result
 *
 * @example
 * ```typescript
 * import { prepareArciumBattle } from '@hidden-warrior/arcium-core';
 *
 * const result = await prepareArciumBattle(
 *   program,
 *   provider,
 *   { strength: 85, agility: 70, endurance: 90, intelligence: 75 },
 *   publicKey
 * );
 *
 * // Use result.args and result.accounts in your transaction
 * const tx = await program.methods
 *   .battleWarrior(result.args.computationOffset, result.args.warriorStats, result.args.pubKey, result.args.nonce)
 *   .accounts(result.accounts)
 *   .transaction();
 * ```
 */
export async function prepareArciumBattle(
  program: anchor.Program<any>,
  provider: anchor.AnchorProvider,
  warriorStats: WarriorStats,
  _payerPubkey: PublicKey,
  config: ArciumConfig = {}
): Promise<ArciumPreparationResult> {
  const {
    getMXEPublicKeyWithRetry,
    generateKeyPair,
    encryptWarriorStats,
    generateNonce,
    generateComputationOffset,
    deriveArciumAccounts,
    validateWarriorStats,
  } = await import('./utils');

  // Validate input
  validateWarriorStats(warriorStats);

  // Get MXE public key
  const { publicKey: mxePublicKey } = await getMXEPublicKeyWithRetry(provider, program.programId, config);

  // Generate encryption keys
  const { privateKey: clientPrivateKey, publicKey: clientPublicKey } = generateKeyPair();

  // Compute shared secret
  const { x25519 } = await import('@arcium-hq/client');
  const sharedSecret = x25519.getSharedSecret(clientPrivateKey, mxePublicKey);

  // Generate nonce
  const nonceBytes = generateNonce();
  const { deserializeLE } = await import('@arcium-hq/client');
  const nonceBN = new anchor.BN(deserializeLE(nonceBytes).toString());

  // Encrypt warrior statistics
  const encryptedWarriorStats = encryptWarriorStats(warriorStats, sharedSecret, nonceBytes);

  // Generate computation offset
  const computationOffset = generateComputationOffset();

  // Derive all required accounts
  const accounts = deriveArciumAccounts(program.programId, computationOffset);

  return {
    args: {
      computationOffset,
      warriorStats: encryptedWarriorStats,
      pubKey: new Uint8Array(clientPublicKey),
      nonce: nonceBN,
    },
    accounts,
  };
}

/**
 * Version information
 */
export const VERSION = '0.1.0';

/**
 * Package metadata
 */
export const PACKAGE_INFO = {
  name: '@hidden-warrior/arcium-core',
  version: VERSION,
  description: 'Privacy-focused computation framework for Solana using Arcium technology',
} as const;
