# Contributing to BahiBar

Thank you for your interest in contributing to BahiBar! We welcome contributions from developers, designers, gym owners, and testers of all experience levels.

## Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later (LTS recommended)
- **Package Manager**: `npm` (v10+)
- **Git**

### Local Development Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/bahibar.git
   cd bahibar
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   ```
   *Note: By default, BahiBar supports zero-config offline mode (`.local-db.json`). You do NOT need live Supabase credentials to explore or build local features.*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests and Quality Checks

Before submitting a Pull Request, ensure all tests pass and code compiles cleanly:

```bash
# Run unit test suite
npm test

# Run type-checking & production build
npm run build

# Run linting
npm run lint
```

## Pull Request Process

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Commit Guidelines**:
   - Write clear, concise commit messages.
   - Example: `feat(members): add filter by expiry status` or `fix(receipt): align rupee symbol on mobile view`.
   - Never commit sensitive keys, real phone numbers, or `.env.local`.

3. **Submit the PR**:
   - Reference any related issue (e.g. `Closes #12`).
   - Include a description of changes and screenshots for UI updates.
   - Verify that all CI checks (tests and build) pass.

## Community & Questions

Have ideas or questions? Feel free to open a [GitHub Discussion](https://github.com/bahibar/bahibar/discussions) or submit a feature proposal!
