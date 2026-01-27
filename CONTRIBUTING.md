# Contributing to YETO

Thank you for your interest in contributing to the Yemen Economic Transparency Observatory (YETO). This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We are committed to providing a harassment-free experience for everyone.

## How to Contribute

### Reporting Issues

1. **Search existing issues** before creating a new one
2. **Use the issue template** to provide necessary information
3. **Include reproduction steps** for bugs
4. **Label appropriately** (bug, enhancement, documentation, etc.)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding standards** outlined below
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/yeto.git
cd yeto

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Start development server
pnpm dev
```

## Coding Standards

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer interfaces over types for object shapes
- Use Zod for runtime validation
- Export types from shared modules

### React

- Use functional components with hooks
- Follow the component structure in `client/src/components`
- Use shadcn/ui components when possible
- Support both English and Arabic (RTL)

### Testing

- Write unit tests for all new functions
- Use Vitest for testing
- Aim for >80% code coverage
- Test both success and error paths

### Commit Messages

Follow conventional commits:

```
feat: add new indicator dashboard
fix: resolve FX rate calculation error
docs: update API documentation
test: add tests for truth layer
refactor: simplify connector base class
```

## Data Contribution

### Adding New Data Sources

1. Create a connector in `server/connectors/`
2. Register the source in `evidenceSources` table
3. Implement the `BaseConnector` interface
4. Add provenance tracking
5. Write tests for the connector

### Data Quality Requirements

- All data must have provenance
- Include source URL and retrieval date
- Apply regime tags (IRG/DFA/UNIFIED)
- Validate against schema before insertion

## Documentation

- Update README.md for major features
- Add JSDoc comments for public functions
- Update API.md for new endpoints
- Include Arabic translations where applicable

## Review Process

1. All PRs require at least one review
2. CI must pass before merge
3. Documentation must be updated
4. Tests must cover new functionality

## Questions?

- Open a GitHub Discussion
- Contact the maintainers
- Check the documentation

---

*Thank you for contributing to economic transparency in Yemen!*
