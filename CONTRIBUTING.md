# Contributing to @hidden-warrior/arcium-core

Thank you for your interest in contributing to @hidden-warrior/arcium-core! This guide will help you get started with development and ensure your contributions are properly integrated.

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm
- Git

### Installation

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/Hidden-Warriors/arcium-core.git
   cd arcium-core
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Install peer dependencies**
   ```bash
   npm install @solana/web3.js @coral-xyz/anchor @arcium-hq/client
   ```

4. **Set up development environment**
   ```bash
   npm run build
   ```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Building the Package

```bash
# Build for production
npm run build

# Build and watch for changes
npm run dev

# Clean build artifacts
npm run clean
```

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Type checking
npm run typecheck
```

## Project Structure

```
src/
├── index.ts              # Main entry point
├── types/
│   └── index.ts         # TypeScript interfaces and types
└── utils/
    └── index.ts         # Core utility functions
examples/
├── basic-battle.ts      # Basic usage example
└── advanced-usage.ts    # Advanced patterns
tests/
├── arcium-core.test.ts  # Main test suite
└── setup.ts            # Test configuration
```

## Code Style

This project uses:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for testing
- **Tsup** for building

### Code Standards

- Use TypeScript for all new code
- Follow the existing code style (checked by ESLint)
- Write comprehensive tests for new features
- Document public APIs with JSDoc comments
- Use meaningful variable and function names
- Follow the single responsibility principle

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow the existing code patterns
- Add tests for new functionality
- Update documentation if needed
- Ensure all tests pass

### 3. Test Your Changes

```bash
npm test
npm run lint
npm run typecheck
```

### 4. Update Documentation

- Update README.md if adding new features
- Add JSDoc comments for new public APIs
- Update examples if needed

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

Use conventional commit messages:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation updates
- `test:` for test-related changes
- `refactor:` for code refactoring
- `chore:` for maintenance tasks

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Adding New Features

### Core Utilities

When adding new utility functions:

1. Add the function to `src/utils/index.ts`
2. Export it from the main `src/index.ts`
3. Add comprehensive tests in `tests/arcium-core.test.ts`
4. Update the README with usage examples

### Types and Interfaces

When adding new types:

1. Add them to `src/types/index.ts`
2. Ensure they are properly exported
3. Add validation functions if needed
4. Update examples to show usage

### Error Handling

When adding new error types:

1. Add to `ArciumErrorType` enum in `src/types/index.ts`
2. Create appropriate error messages
3. Add tests for error conditions
4. Update documentation

## Testing Guidelines

### Unit Tests

- Test all public functions
- Test edge cases and error conditions
- Use descriptive test names
- Mock external dependencies
- Aim for high code coverage

### Integration Tests

- Test complete workflows
- Use real Solana/testnet when possible
- Test error scenarios
- Validate against real contracts

### Performance Tests

- Test cryptographic operations
- Measure execution time
- Test with large datasets
- Profile memory usage

## Documentation

### Code Documentation

- Use JSDoc comments for all public APIs
- Include parameter types and descriptions
- Add usage examples in comments
- Document error conditions

### README Updates

- Update API reference sections
- Add new usage examples
- Update installation instructions if needed
- Keep feature list current

### Examples

- Create working examples for new features
- Include both simple and advanced usage
- Add comments explaining each step
- Test examples before publishing

## Security Considerations

### Cryptographic Security

- Never expose private keys
- Use secure random number generation
- Follow cryptographic best practices
- Validate all inputs

### Smart Contract Security

- Validate account ownership
- Check authorization properly
- Use recent blockhashes
- Handle transaction failures gracefully

### Data Privacy

- Encrypt sensitive data properly
- Use appropriate key sizes
- Implement secure key exchange
- Follow privacy best practices

## Release Process

### Versioning

This project uses [Semantic Versioning](https://semver.org/):

- **Major** (x.0.0): Breaking changes
- **Minor** (x.y.0): New features (backward compatible)
- **Patch** (x.y.z): Bug fixes (backward compatible)

### Publishing

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Build package
5. Create git tag
6. Publish to npm

## Getting Help

- 📧 **Email**: support@hiddenwarrior.fun
- 💬 **Discord**: [Join our community](https://discord.gg/hiddenwarrior)
- 📖 **Documentation**: [Full API docs](https://docs.hiddenwarrior.fun/arcium-core)
- 🐛 **Issues**: [Report bugs](https://github.com/Hidden-Warriors/arcium-core/issues)

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

**Happy coding! 🚀**
