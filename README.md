# @hidden-warrior/arcium-core

[![npm version](https://badge.fury.io/js/@hidden-warrior%2Farcium-core.svg)](https://badge.fury.io/js/@hidden-warrior%2Farcium-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> Privacy-focused computation framework for Solana using Arcium technology

## Overview

`@hidden-warrior/arcium-core` is a comprehensive TypeScript library that provides privacy-focused computation capabilities for Solana blockchain applications. It leverages Arcium's Multi-party Execution Environment (MXE) to enable secure, private computations while maintaining the decentralization benefits of blockchain technology.

## Key Features

- 🔐 **Private Data Encryption**: Secure encryption of sensitive data using Rescue Cipher
- 🏦 **MXE Integration**: Full integration with Arcium's Multi-party Execution Environment
- 🔑 **Key Management**: Automatic key generation and exchange for secure communications
- ⚡ **Account Derivation**: Automated derivation of all required Arcium account addresses
- 🎮 **Game-Ready**: Specifically designed for gaming applications with private battles
- 🛡️ **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🧪 **Testing Support**: Built-in utilities for testing and simulation

## Installation

```bash
npm install @hidden-warrior/arcium-core
# or
yarn add @hidden-warrior/arcium-core
# or
pnpm add @hidden-warrior/arcium-core
```

## Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install @solana/web3.js @coral-xyz/anchor @arcium-hq/client
```

## Quick Start

### Basic Usage

```typescript
import { prepareArciumBattle } from '@hidden-warrior/arcium-core';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

// Initialize your Anchor program
const provider = new AnchorProvider(connection, wallet);
const program = new Program(idl, programId, provider);

// Prepare a private battle
const result = await prepareArciumBattle(
  program,
  provider,
  { strength: 85, agility: 70, endurance: 90, intelligence: 75 },
  wallet.publicKey
);

// Use the result in your transaction
const tx = await program.methods
  .battleWarrior(
    result.args.computationOffset,
    result.args.warriorStats,
    result.args.pubKey,
    result.args.nonce
  )
  .accounts(result.accounts)
  .transaction();
```

### Manual Encryption

```typescript
import {
  generateKeyPair,
  encryptWarriorStats,
  generateNonce
} from '@hidden-warrior/arcium-core';

const keyPair = generateKeyPair();
const nonce = generateNonce();
const sharedSecret = deriveSharedSecret(keyPair.privateKey, mxePublicKey);

const encryptedStats = encryptWarriorStats(
  { strength: 85, agility: 70, endurance: 90, intelligence: 75 },
  sharedSecret,
  nonce
);
```

## API Reference

### Core Functions

#### `prepareArciumBattle`

Main function for preparing private battles with complete Arcium integration.

```typescript
function prepareArciumBattle(
  program: Program,
  provider: AnchorProvider,
  warriorStats: WarriorStats,
  payerPubkey: PublicKey,
  config?: ArciumConfig
): Promise<ArciumPreparationResult>
```

**Parameters:**
- `program`: Anchor program instance
- `provider`: Anchor provider
- `warriorStats`: Warrior statistics to encrypt
- `payerPubkey`: Public key of transaction payer
- `config`: Optional configuration

**Returns:** `ArciumPreparationResult` with encrypted arguments and account addresses

#### `getMXEPublicKeyWithRetry`

Retrieves MXE public key with automatic retry logic.

```typescript
function getMXEPublicKeyWithRetry(
  provider: AnchorProvider,
  programId: PublicKey,
  config?: ArciumConfig
): Promise<MXEPublicKeyResult>
```

#### `encryptWarriorStats`

Encrypts warrior statistics for private computation.

```typescript
function encryptWarriorStats(
  warriorStats: WarriorStats,
  sharedSecret: Uint8Array,
  nonce: Uint8Array
): Uint8Array
```

### Types

#### `WarriorStats`
```typescript
interface WarriorStats {
  strength: number;
  agility: number;
  endurance: number;
  intelligence: number;
}
```

#### `ArciumPreparationResult`
```typescript
interface ArciumPreparationResult {
  args: ArciumBattleArgs;
  accounts: ArciumAccounts;
}
```

#### `ArciumConfig`
```typescript
interface ArciumConfig {
  maxRetries?: number;
  retryDelayMs?: number;
  debug?: boolean;
}
```

## Advanced Usage

### Custom Configuration

```typescript
const config: ArciumConfig = {
  maxRetries: 5,
  retryDelayMs: 1000,
  debug: true,
};

const result = await prepareArciumBattle(
  program,
  provider,
  warriorStats,
  payerPubkey,
  config
);
```

### Manual Account Derivation

```typescript
import { deriveArciumAccounts, generateComputationOffset } from '@hidden-warrior/arcium-core';

const computationOffset = generateComputationOffset();
const accounts = deriveArciumAccounts(programId, computationOffset);
```

### Error Handling

```typescript
import { ArciumError, ArciumErrorType } from '@hidden-warrior/arcium-core';

try {
  const result = await prepareArciumBattle(program, provider, warriorStats, payerPubkey);
} catch (error) {
  if (error instanceof ArciumError) {
    switch (error.type) {
      case ArciumErrorType.MXE_CONNECTION_FAILED:
        console.error('MXE connection failed:', error.message);
        break;
      case ArciumErrorType.ENCRYPTION_FAILED:
        console.error('Encryption failed:', error.message);
        break;
      // Handle other error types
    }
  }
}
```

## Testing

The package includes utilities for testing and simulation:

```typescript
import { simulateArciumBattleResult } from '@hidden-warrior/arcium-core';

// Simulate battle result for testing
const result = await simulateArciumBattleResult(85, 1000); // 1 second delay
console.log(result.outcome); // 'Victory', 'Defeat', or 'Draw'
```

## Architecture

### Core Components

1. **Encryption Layer**: Handles Rescue Cipher encryption/decryption
2. **MXE Integration**: Manages communication with Multi-party Execution Environment
3. **Account Management**: Derives and manages all required blockchain accounts
4. **Key Management**: Generates and exchanges cryptographic keys
5. **Error Handling**: Comprehensive error handling with specific error types

### Security Model

- **Private Key Generation**: Uses cryptographically secure random number generation
- **Key Exchange**: Implements x25519 elliptic curve Diffie-Hellman key exchange
- **Data Encryption**: Uses Rescue Cipher for symmetric encryption
- **Account Isolation**: Each computation uses unique accounts and offsets

## Use Cases

### Gaming Applications

```typescript
// Perfect for turn-based strategy games
const battleResult = await prepareArciumBattle(
  program,
  provider,
  playerStats,
  playerPubkey
);

// Execute private battle
const tx = await program.methods
  .executePrivateBattle(battleResult.args)
  .accounts(battleResult.accounts)
  .rpc();
```

### NFT with Private Attributes

```typescript
// NFTs with encrypted metadata
const encryptedAttributes = encryptWarriorStats(
  nftAttributes,
  sharedSecret,
  nonce
);

// Mint NFT with private attributes
const mintResult = await program.methods
  .mintPrivateNFT(encryptedAttributes)
  .accounts(accounts)
  .rpc();
```

### Prediction Markets

```typescript
// Private prediction outcomes
const encryptedPrediction = encryptData(
  predictionData,
  sharedSecret,
  nonce
);
```

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 **Email**: support@hiddenwarrior.fun
- 💬 **Discord**: [Join our community](https://discord.gg/hiddenwarrior)
- 📖 **Documentation**: [Full API docs](https://docs.hiddenwarrior.fun/arcium-core)
- 🐛 **Issues**: [Report bugs](https://github.com/hidden-warrior/arcium-core/issues)

## Related Packages

- `@hidden-warrior/privacy-nft` - NFT with privacy features
- `@hidden-warrior/battle-privacy` - Privacy-first battle system
- `@hidden-warrior/ui` - UI components for privacy features

## Acknowledgments

- Built on top of [Arcium](https://arcium.com) technology
- Inspired by privacy-preserving computation research
- Designed for the Solana ecosystem

---

**Made with ❤️ by the Hidden Warrior team**
