/**
 * @packageDocumentation
 * @module @hidden-warrior/arcium-core
 */

import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import {
  x25519,
  RescueCipher,
  deserializeLE,
  getMXEAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getComputationAccAddress,
  getArciumProgAddress,
  getMXEPublicKey,
} from '@arcium-hq/client';
import {
  WarriorStats,
  ArciumKeyPair,
  EncryptedData,
  ArciumAccounts,
  ArciumConfig,
  ArciumError,
  ArciumErrorType,
  MXEPublicKeyResult,
  MockOpponent,
  MockBattleResult,
} from '../types';

// Default configuration
const DEFAULT_CONFIG: Required<ArciumConfig> = {
  maxRetries: 10,
  retryDelayMs: 500,
  debug: false,
};

// Pre-initialized comp_def account from admin
const INITIALIZED_COMP_DEF_ACCOUNT = new PublicKey('3hVwonP9B5ZSWoDBnsM2PBrcRPyUFDvFVuR366bqJUaD');

// Fixed account addresses from IDL
const POOL_ACCOUNT_PUBKEY = new PublicKey('7MGSS4iKNM4sVib7bDZDJhVqB6EcchPwVnTKenCY1jt3');
const CLOCK_ACCOUNT_PUBKEY = new PublicKey('FHriyvoZotYiFnbUzKFjzRSb2NiaC8RPWY7jtKuKhg65');
const PROGRAM_CALCULATED_CLUSTER = new PublicKey('2qibdmpiSHrzcvbqQ9c9PEx17Q9KhyKSMuxuRP8AYJ9c');

/**
 * Helper function to get MXE public key with retries
 *
 * @param provider - Anchor provider
 * @param programId - Program ID for MXE operations
 * @param config - Arcium configuration
 * @returns Promise resolving to MXE public key result
 * @throws ArciumError if all retries fail
 */
export async function getMXEPublicKeyWithRetry(
  provider: anchor.AnchorProvider,
  programId: PublicKey,
  config: ArciumConfig = {}
): Promise<MXEPublicKeyResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  for (let attempt = 1; attempt <= mergedConfig.maxRetries; attempt++) {
    try {
      if (mergedConfig.debug) {
        console.log(`Attempt ${attempt} to fetch MXE public key...`);
      }

      const mxePublicKey = await getMXEPublicKey(provider, programId);
      if (mxePublicKey) {
        return {
          publicKey: mxePublicKey,
          attempts: attempt,
        };
      }
    } catch (error) {
      if (mergedConfig.debug) {
        console.log(`Attempt ${attempt} failed to fetch MXE public key:`, error);
      }
    }

    if (attempt < mergedConfig.maxRetries) {
      if (mergedConfig.debug) {
        console.log(
          `Retrying in ${mergedConfig.retryDelayMs}ms... (attempt ${attempt}/${mergedConfig.maxRetries})`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, mergedConfig.retryDelayMs));
    }
  }

  throw new ArciumError(
    ArciumErrorType.MXE_CONNECTION_FAILED,
    `Failed to fetch MXE public key after ${mergedConfig.maxRetries} attempts`
  );
}

/**
 * Generate a new key pair for Arcium encryption
 *
 * @returns Arcium key pair
 * @throws ArciumError if key generation fails
 */
export function generateKeyPair(): ArciumKeyPair {
  try {
    const privateKey = x25519.utils.randomPrivateKey();
    const publicKey = x25519.getPublicKey(privateKey);

    return {
      privateKey,
      publicKey,
    };
  } catch (error) {
    throw new ArciumError(
      ArciumErrorType.KEY_GENERATION_FAILED,
      'Failed to generate encryption key pair',
      error as Error
    );
  }
}

/**
 * Encrypt data using Arcium Rescue Cipher
 *
 * @param data - Data to encrypt (must implement EncryptableData interface)
 * @param sharedSecret - Shared secret from key exchange
 * @param nonce - Nonce for encryption
 * @returns Encrypted data structure
 * @throws ArciumError if encryption fails
 */
export function encryptData(
  data: bigint,
  sharedSecret: Uint8Array,
  nonce: Uint8Array
): EncryptedData {
  try {
    const cipher = new RescueCipher(sharedSecret);
    const encryptedComponents = cipher.encrypt([data], nonce);

    return {
      encryptedData: encryptedComponents.map(component => new Uint8Array(component || [])),
      nonce,
      publicKey: new Uint8Array(32), // Placeholder - should be passed in
    };
  } catch (error) {
    throw new ArciumError(
      ArciumErrorType.ENCRYPTION_FAILED,
      'Failed to encrypt data with Rescue Cipher',
      error as Error
    );
  }
}

/**
 * Encrypt warrior statistics for private computation
 *
 * @param warriorStats - Warrior statistics to encrypt
 * @param sharedSecret - Shared secret from key exchange
 * @param nonce - Nonce for encryption
 * @returns Array of encrypted statistics (ready for blockchain)
 * @throws ArciumError if encryption fails
 */
export function encryptWarriorStats(
  warriorStats: WarriorStats,
  sharedSecret: Uint8Array,
  nonce: Uint8Array
): Uint8Array {
  try {
    // Create ArrayBuffer and DataView for serialization
    const statsArrayBuffer = new ArrayBuffer(32); // 4 stats * 8 bytes each (u64)
    const statsDataView = new DataView(statsArrayBuffer);

    // Write values using DataView with Little Endian
    statsDataView.setBigUint64(0, BigInt(warriorStats.strength), true);
    statsDataView.setBigUint64(8, BigInt(warriorStats.agility), true);
    statsDataView.setBigUint64(16, BigInt(warriorStats.endurance), true);
    statsDataView.setBigUint64(24, BigInt(warriorStats.intelligence), true);

    // Convert to Buffer and then to BigInt for encryption
    const statsBuffer = Buffer.from(statsArrayBuffer);
    const combinedStatsBigInt = deserializeLE(statsBuffer);

    // Encrypt the combined statistics
    const cipher = new RescueCipher(sharedSecret);
    const encryptedStatsComponents = cipher.encrypt([combinedStatsBigInt], nonce);

    return new Uint8Array(encryptedStatsComponents[0] || []); // [u8; 32]
  } catch (error) {
    throw new ArciumError(
      ArciumErrorType.ENCRYPTION_FAILED,
      'Failed to encrypt warrior statistics',
      error as Error
    );
  }
}

/**
 * Generate a random nonce for encryption
 *
 * @param length - Length of nonce in bytes (default: 16)
 * @returns Random nonce bytes
 */
export function generateNonce(length: number = 16): Uint8Array {
  const nonce = new Uint8Array(length);
  crypto.getRandomValues(nonce);
  return nonce;
}

/**
 * Generate a random computation offset
 *
 * @param length - Length in bytes (default: 8)
 * @returns Random computation offset as BN
 */
export function generateComputationOffset(length: number = 8): anchor.BN {
  const offsetBytes = new Uint8Array(length);
  crypto.getRandomValues(offsetBytes);
  return new anchor.BN(deserializeLE(offsetBytes).toString());
}

/**
 * Derive all required Arcium account addresses
 *
 * @param programId - Program ID for account derivation
 * @param computationOffset - Computation offset for unique accounts
 * @returns Complete set of Arcium accounts
 */
export function deriveArciumAccounts(
  programId: PublicKey,
  computationOffset: anchor.BN
): ArciumAccounts {
  try {
    const mxeAccount = getMXEAccAddress(programId);
    const mempoolAccount = getMempoolAccAddress(programId);
    const executingPool = getExecutingPoolAccAddress(programId);
    const computationAccount = getComputationAccAddress(programId, computationOffset);
    const compDefAccount = INITIALIZED_COMP_DEF_ACCOUNT;
    const clusterAccount = PROGRAM_CALCULATED_CLUSTER;
    const poolAccount = POOL_ACCOUNT_PUBKEY;
    const clockAccount = CLOCK_ACCOUNT_PUBKEY;
    const arciumProgram = getArciumProgAddress();

    // Derive battle result PDA
    const [battleResult] = PublicKey.findProgramAddressSync(
      [Buffer.from("battle_result")],
      programId
    );

    return {
      mxeAccount,
      mempoolAccount,
      executingPool,
      computationAccount,
      compDefAccount,
      clusterAccount,
      poolAccount,
      clockAccount,
      battleResult,
      systemProgram: SystemProgram.programId,
      arciumProgram,
    };
  } catch (error) {
    throw new ArciumError(
      ArciumErrorType.ACCOUNT_DERIVATION_FAILED,
      'Failed to derive Arcium account addresses',
      error as Error
    );
  }
}

/**
 * Simulate a battle result for testing purposes
 *
 * @param warriorStrength - Strength of the player's warrior
 * @param delayMs - Delay before resolving (for UX)
 * @returns Promise resolving to mock battle result
 */
export async function simulateArciumBattleResult(
  warriorStrength: number,
  delayMs: number = 3000
): Promise<MockBattleResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate opponent
      const opponentNames = ["Shadow Fiend", "Stone Golem", "Swift Rogue", "Mystic Sorcerer", "Ironclad Knight"];
      const opponentName = opponentNames[Math.floor(Math.random() * opponentNames.length)];
      const opponentStrength = Math.floor(Math.random() * 61) + 40; // 40-100

      const opponent: MockOpponent = {
        name: opponentName || 'Unknown Opponent',
        strength: opponentStrength || 50,
        image: '/assets/battle/opponent-default.png'
      };

      const randomFactor = Math.random();
      const strengthDifference = warriorStrength - opponentStrength;

      let outcome: MockBattleResult['outcome'];

      // Battle logic based on strength difference
      if (strengthDifference > 20) {
        outcome = randomFactor < 0.85 ? 'Victory' : 'Draw';
      } else if (strengthDifference > 0) {
        outcome = randomFactor < 0.65 ? 'Victory' : (randomFactor < 0.85 ? 'Draw' : 'Defeat');
      } else if (strengthDifference === 0) {
        outcome = randomFactor < 0.33 ? 'Victory' : (randomFactor < 0.66 ? 'Draw' : 'Defeat');
      } else if (strengthDifference > -20) {
        outcome = randomFactor < 0.35 ? 'Victory' : (randomFactor < 0.6 ? 'Defeat' : 'Draw');
      } else {
        outcome = randomFactor < 0.15 ? 'Victory' : 'Defeat';
      }

      const mockProof = `mock_proof_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;

      resolve({
        outcome,
        proof: mockProof,
        details: `Your Warrior (Str: ${warriorStrength}) vs ${opponent.name} (Str: ${opponent.strength}). Outcome: ${outcome}.`,
        opponent,
      });
    }, delayMs);
  });
}

/**
 * Validate warrior statistics before encryption
 *
 * @param stats - Warrior statistics to validate
 * @throws ArciumError if validation fails
 */
export function validateWarriorStats(stats: WarriorStats): void {
  const { strength, agility, endurance, intelligence } = stats;

  if (typeof strength !== 'number' || strength < 0 || strength > 100) {
    throw new ArciumError(
      ArciumErrorType.INVALID_INPUT,
      'Strength must be a number between 0 and 100'
    );
  }

  if (typeof agility !== 'number' || agility < 0 || agility > 100) {
    throw new ArciumError(
      ArciumErrorType.INVALID_INPUT,
      'Agility must be a number between 0 and 100'
    );
  }

  if (typeof endurance !== 'number' || endurance < 0 || endurance > 100) {
    throw new ArciumError(
      ArciumErrorType.INVALID_INPUT,
      'Endurance must be a number between 0 and 100'
    );
  }

  if (typeof intelligence !== 'number' || intelligence < 0 || intelligence > 100) {
    throw new ArciumError(
      ArciumErrorType.INVALID_INPUT,
      'Intelligence must be a number between 0 and 100'
    );
  }
}
