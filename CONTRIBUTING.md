# Contributing to Tiny Screen Studios

Thank you for your interest in contributing to Tiny Screen Studios! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Git

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/tinyscreenstudio/tiny-screen-studios.git
   cd tiny-screen-studios
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🏗️ Project Structure

- `packages/core/` - Core TypeScript library
- `packages/ui/` - Web interface
- `docs/` - Documentation
- `examples/` - Usage examples

## 🧪 Testing

Run the test suite before submitting changes:

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter core test
pnpm --filter ui test

# Run tests in watch mode
pnpm --filter core test:watch
```

## 📝 Code Style

This project uses strict linting and formatting rules:

```bash
# Check code style
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Format code
pnpm format
```

### Code Guidelines

- Use TypeScript with strict mode
- Follow existing code patterns
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🔄 Pull Request Process

1. Ensure your code passes all tests and linting
2. Update documentation if needed
3. Add or update tests for your changes
4. Write a clear pull request description
5. Link any related issues

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(core): add SH1106 display support
fix(ui): resolve image upload issue
docs: update API documentation
test(core): add converter unit tests
```

## 🐛 Bug Reports

When filing bug reports, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)
- Screenshots if applicable

## 💡 Feature Requests

For feature requests, please:

- Check existing issues first
- Provide clear use case
- Explain the expected behavior
- Consider implementation complexity

## 📚 Documentation

Help improve our documentation:

- Fix typos and grammar
- Add examples and tutorials
- Improve API documentation
- Translate to other languages

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and experiences
- Follow the code of conduct

## 📞 Getting Help

- Check the [documentation](https://github.com/tinyscreenstudio/tiny-screen-studios/wiki)
- Search [existing issues](https://github.com/tinyscreenstudio/tiny-screen-studios/issues)
- Start a [discussion](https://github.com/tinyscreenstudio/tiny-screen-studios/discussions)

Thank you for contributing to Tiny Screen Studios! 🎉
