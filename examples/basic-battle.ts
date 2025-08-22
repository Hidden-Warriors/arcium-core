/**
 * @example
 * Basic Arcium Battle Example
 *
 * This example demonstrates how to use @hidden-warrior/arcium-core
 * to prepare and execute a private battle on Solana using Arcium.
 */

import {
  prepareArciumBattle,
  simulateArciumBattleResult,
  WarriorStats,
  ArciumError,
  ArciumErrorType,
} from '@hidden-warrior/arcium-core';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';

// Example IDL - replace with your actual program IDL
const EXAMPLE_IDL = {
  version: "0.1.0",
  name: "hidden_warrior",
  instructions: [
    {
      name: "battleWarrior",
      accounts: [
        { name: "payer", isMut: true, isSigner: true },
        { name: "mxeAccount", isMut: false, isSigner: false },
        { name: "mempoolAccount", isMut: true, isSigner: false },
        // ... other accounts
      ],
      args: [
        { name: "computationOffset", type: "u64" },
        { name: "warriorStats", type: { array: ["u8", 32] } },
        { name: "pubKey", type: { array: ["u8", 32] } },
        { name: "nonce", type: "u64" },
      ],
    },
  ],
  address: "Nhq4fa4xRVPMXE8EE3qnFCRs8g8v5Lm8hVoYr2sPd1n", // Example program ID
};

/**
 * Example warrior class that implements WarriorStats
 */
class GameWarrior implements WarriorStats {
  constructor(
    public strength: number,
    public agility: number,
    public endurance: number,
    public intelligence: number,
    public name: string,
    public level: number = 1
  ) {}

  /**
   * Calculate total power for battle simulation
   */
  get totalPower(): number {
    return (this.strength + this.agility + this.endurance + this.intelligence) / 4;
  }

  /**
   * Level up the warrior
   */
  levelUp(): void {
    this.level++;
    // Simple stat increase
    this.strength = Math.min(100, this.strength + 2);
    this.agility = Math.min(100, this.agility + 2);
    this.endurance = Math.min(100, this.endurance + 2);
    this.intelligence = Math.min(100, this.intelligence + 2);
  }
}

/**
 * Example wallet adapter for testing
 */
class ExampleWallet implements Wallet {
  constructor(private keypair: Keypair) {}

  get publicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  async signTransaction(tx: any): Promise<any> {
    tx.partialSign(this.keypair);
    return tx;
  }

  async signAllTransactions(txs: any[]): Promise<any[]> {
    return txs.map((tx) => {
      tx.partialSign(this.keypair);
      return tx;
    });
  }
}

/**
 * Main battle example
 */
async function runBattleExample() {
  console.log('🛡️  Starting Arcium Battle Example...\n');

  try {
    // 1. Setup connection and wallet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const wallet = new ExampleWallet(Keypair.generate());

    console.log('🔑 Using wallet:', wallet.publicKey.toString());

    // 2. Setup Anchor provider and program
    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    const program = new Program(EXAMPLE_IDL, provider);

    console.log('📡 Connected to program:', program.programId.toString());

    // 3. Create warrior
    const playerWarrior = new GameWarrior(85, 70, 90, 75, 'Arcium Warrior');
    console.log('⚔️  Created warrior:', {
      name: playerWarrior.name,
      level: playerWarrior.level,
      strength: playerWarrior.strength,
      agility: playerWarrior.agility,
      endurance: playerWarrior.endurance,
      intelligence: playerWarrior.intelligence,
      totalPower: playerWarrior.totalPower.toFixed(1),
    });

    // 4. Prepare Arcium battle
    console.log('\n🔐 Preparing private battle with Arcium...');

    const battlePreparation = await prepareArciumBattle(
      program,
      provider,
      playerWarrior,
      wallet.publicKey,
      {
        debug: true, // Enable debug logging
        maxRetries: 5,
      }
    );

    console.log('✅ Battle prepared successfully!');
    console.log('📊 Encrypted stats length:', battlePreparation.args.warriorStats.length);
    console.log('🔢 Computation offset:', battlePreparation.args.computationOffset.toString());
    console.log('🔑 Public key length:', battlePreparation.args.pubKey.length);

    // 5. Build transaction (without sending for demo)
    const transaction = await program.methods
      .battleWarrior(
        battlePreparation.args.computationOffset,
        battlePreparation.args.warriorStats,
        battlePreparation.args.pubKey,
        battlePreparation.args.nonce
      )
      .accounts(battlePreparation.accounts)
      .transaction();

    console.log('\n📋 Transaction built successfully!');
    console.log('📦 Transaction size:', transaction.serialize().length, 'bytes');

    // 6. Simulate battle result
    console.log('\n🎮 Simulating battle result...');

    const battleResult = await simulateArciumBattleResult(
      playerWarrior.strength,
      2000 // 2 second delay for demo
    );

    console.log('🎯 Battle result:', {
      outcome: battleResult.outcome,
      opponent: battleResult.opponent?.name,
      opponentStrength: battleResult.opponent?.strength,
      details: battleResult.details,
    });

    // 7. Handle battle outcome
    if (battleResult.outcome === 'Victory') {
      console.log('🎉 Victory! Leveling up warrior...');
      playerWarrior.levelUp();
      console.log('⬆️  New level:', playerWarrior.level);
    } else {
      console.log('💪 Better luck next time! Keep training...');
    }

    console.log('\n✅ Battle example completed successfully!');

  } catch (error) {
    if (error instanceof ArciumError) {
      console.error('❌ Arcium Error:', error.type, '-', error.message);

      switch (error.type) {
        case ArciumErrorType.MXE_CONNECTION_FAILED:
          console.error('💡 Tip: Check your internet connection and try again');
          break;
        case ArciumErrorType.ENCRYPTION_FAILED:
          console.error('💡 Tip: Verify your warrior stats are valid (0-100 range)');
          break;
        case ArciumErrorType.INVALID_INPUT:
          console.error('💡 Tip: Check input parameters and try again');
          break;
        default:
          console.error('💡 Tip: Check the error details and try again');
      }
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

/**
 * Advanced example with custom error handling
 */
async function advancedBattleExample() {
  console.log('\n🛡️  Running Advanced Battle Example...\n');

  try {
    // Setup (same as basic example)
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const wallet = new ExampleWallet(Keypair.generate());
    const provider = new AnchorProvider(connection, wallet);
    const program = new Program(EXAMPLE_IDL, provider);

    // Create multiple warriors for comparison
    const warriors = [
      new GameWarrior(95, 60, 85, 80, 'Tank Warrior'),
      new GameWarrior(70, 95, 75, 85, 'Speed Warrior'),
      new GameWarrior(80, 80, 80, 80, 'Balanced Warrior'),
    ];

    console.log('🏆 Testing multiple warriors:\n');

    for (const warrior of warriors) {
      console.log(`\n⚔️  Testing ${warrior.name}...`);

      // Prepare battle with retry configuration
      const battleResult = await prepareArciumBattle(
        program,
        provider,
        warrior,
        wallet.publicKey,
        {
          maxRetries: 3,
          retryDelayMs: 1000,
          debug: false, // Disable debug for cleaner output
        }
      );

      // Simulate multiple battles for statistics
      const battleOutcomes = [];
      for (let i = 0; i < 5; i++) {
        const result = await simulateArciumBattleResult(warrior.strength, 500);
        battleOutcomes.push(result.outcome);
      }

      const victories = battleOutcomes.filter(o => o === 'Victory').length;
      const winRate = (victories / battleOutcomes.length) * 100;

      console.log(`📊 ${warrior.name} Results:`);
      console.log(`   - Win Rate: ${winRate.toFixed(1)}% (${victories}/${battleOutcomes.length})`);
      console.log(`   - Total Power: ${warrior.totalPower.toFixed(1)}`);
      console.log(`   - Encrypted successfully: ✅`);
    }

    console.log('\n✅ Advanced example completed!');

  } catch (error) {
    console.error('❌ Advanced example failed:', error);
  }
}

/**
 * Utility function to demonstrate error handling
 */
async function errorHandlingExample() {
  console.log('\n🛡️  Running Error Handling Example...\n');

  try {
    // This will fail due to invalid program
    const invalidProgram = null as any;
    await prepareArciumBattle(
      invalidProgram,
      {} as any,
      { strength: 50, agility: 50, endurance: 50, intelligence: 50 },
      PublicKey.default
    );
  } catch (error) {
    if (error instanceof ArciumError) {
      console.log('✅ Caught expected Arcium error:');
      console.log('   Type:', error.type);
      console.log('   Message:', error.message);
    } else {
      console.log('❌ Unexpected error type:', typeof error);
    }
  }
}

// Run all examples
async function main() {
  console.log('🚀 Arcium Core Examples\n');

  await runBattleExample();
  await advancedBattleExample();
  await errorHandlingExample();

  console.log('\n🎯 All examples completed!');
  console.log('📚 Check the README.md for more examples and API documentation');
}

// Export for use in other files
export {
  runBattleExample,
  advancedBattleExample,
  errorHandlingExample,
  GameWarrior,
  ExampleWallet,
};

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
