# arcium-core

[![npm version](https://badge.fury.io/js/arcium-core.svg)](https://badge.fury.io/js/arcium-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

privacy-focused computation framework for solana using arcium technology

## what it is

- npm package for private computation on solana
- typescript library with full types
- plug-and-play implementation of arcium tech
- 21 tests + full docs

## what it does

- encrypts game character stats privately
- handles secure key exchange automatically
- works with existing solana programs
- provides testing and simulation tools

## install

```bash
npm install arcium-core
# or
yarn add arcium-core
# or
pnpm add arcium-core
```

## you also need

```bash
npm install @solana/web3.js @coral-xyz/anchor @arcium-hq/client
```

these are the core solana libraries

## quick start

### basic usage

```typescript
import { prepareArciumBattle } from 'arcium-core';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

// set up your solana program
const provider = new AnchorProvider(connection, wallet);
const program = new Program(idl, programId, provider);

// prepare a private battle
const result = await prepareArciumBattle(
  program,
  provider,
  { strength: 85, agility: 70, endurance: 90, intelligence: 75 },
  wallet.publicKey
);

// use it in your game
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

### manual encryption

```typescript
import {
  generateKeyPair,
  encryptWarriorStats,
  generateNonce
} from 'arcium-core';

const keyPair = generateKeyPair();
const nonce = generateNonce();
const sharedSecret = deriveSharedSecret(keyPair.privateKey, mxePublicKey);

const encryptedStats = encryptWarriorStats(
  { strength: 85, agility: 70, endurance: 90, intelligence: 75 },
  sharedSecret,
  nonce
);
```

## api reference

### main functions

#### `prepareArciumBattle`

main function - does everything for you automatically

```typescript
function prepareArciumBattle(
  program: Program,
  provider: AnchorProvider,
  warriorStats: WarriorStats,
  payerPubkey: PublicKey,
  config?: ArciumConfig
): Promise<ArciumPreparationResult>
```

**what it needs:**
- `program`: your solana program
- `provider`: connection to solana
- `warriorStats`: character stats to encrypt
- `payerPubkey`: wallet address
- `config`: optional settings

**what it returns:** ready-to-use encrypted battle data

#### `getMXEPublicKeyWithRetry`

gets the arcium server key (with auto retry)

```typescript
function getMXEPublicKeyWithRetry(
  provider: AnchorProvider,
  programId: PublicKey,
  config?: ArciumConfig
): Promise<MXEPublicKeyResult>
```

#### `encryptWarriorStats`

encrypts character stats manually

```typescript
function encryptWarriorStats(
  warriorStats: WarriorStats,
  sharedSecret: Uint8Array,
  nonce: Uint8Array
): Uint8Array
```

### types

#### `WarriorStats`
```typescript
interface WarriorStats {
  strength: number;
  agility: number;
  endurance: number;
  intelligence: number;
}
```

your character stats

#### `ArciumPreparationResult`
```typescript
interface ArciumPreparationResult {
  args: ArciumBattleArgs;
  accounts: ArciumAccounts;
}
```

what you get back from prepareArciumBattle

#### `ArciumConfig`
```typescript
interface ArciumConfig {
  maxRetries?: number;
  retryDelayMs?: number;
  debug?: boolean;
}
```

optional settings

## advanced usage

### custom settings

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

### manual account setup

```typescript
import { deriveArciumAccounts, generateComputationOffset } from 'arcium-core';

const computationOffset = generateComputationOffset();
const accounts = deriveArciumAccounts(programId, computationOffset);
```

### error handling

```typescript
import { ArciumError, ArciumErrorType } from 'arcium-core';

try {
  const result = await prepareArciumBattle(program, provider, warriorStats, payerPubkey);
} catch (error) {
  if (error instanceof ArciumError) {
    switch (error.type) {
      case ArciumErrorType.MXE_CONNECTION_FAILED:
        console.error('connection failed:', error.message);
        break;
      case ArciumErrorType.ENCRYPTION_FAILED:
        console.error('encryption failed:', error.message);
        break;
      // handle other errors
    }
  }
}
```

## testing

includes tools for testing your private battles:

```typescript
import { simulateArciumBattleResult } from 'arcium-core';

// test battle results without real blockchain
const result = await simulateArciumBattleResult(85, 1000);
console.log(result.outcome); // 'Victory', 'Defeat', or 'Draw'
```

## how it works inside

### core parts

1. **encryption layer**: handles secure data encryption/decryption
2. **mxe integration**: talks to arcium's private computation server
3. **account management**: creates all needed solana accounts automatically
4. **key management**: handles secure key exchange
5. **error handling**: catches and explains what went wrong

### security

- **private keys**: generated using secure crypto methods
- **key exchange**: uses x25519 elliptic curve (military grade)
- **data encryption**: rescue cipher for symmetric encryption
- **account isolation**: each battle gets unique accounts

## what you can build

### games with private battles

```typescript
// turn-based games where stats are hidden
const battleResult = await prepareArciumBattle(
  program,
  provider,
  playerStats,
  playerPubkey
);

// run private battle on blockchain
const tx = await program.methods
  .executePrivateBattle(battleResult.args)
  .accounts(battleResult.accounts)
  .rpc();
```

### nfts with secret attributes

```typescript
// nfts where some traits are hidden
const encryptedAttributes = encryptWarriorStats(
  nftAttributes,
  sharedSecret,
  nonce
);

// mint nft with private traits
const mintResult = await program.methods
  .mintPrivateNFT(encryptedAttributes)
  .accounts(accounts)
  .rpc();
```

### private predictions

```typescript
// prediction markets with hidden votes
const encryptedPrediction = encryptData(
  predictionData,
  sharedSecret,
  nonce
);
```

## development

### how to test

```bash
# run all tests
npm test

# run with coverage
npm run test:coverage

# test specific file
npm test -- tests/arcium-core.test.ts

# watch mode
npm run test:watch
```

### creating releases

1. **update version** in package.json
2. **update changelog** with what changed
3. **create git tag**:

```bash
git tag -a v1.0.0 -m "Release v1.0.0: your changes"
git push origin v1.0.0
```

github actions will automatically:
- run tests
- build package
- create release
- publish to npm

### contributing

want to help? check [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. fork repo
2. create feature branch
3. make changes
4. submit pull request

## license

MIT - see [LICENSE](LICENSE) file
