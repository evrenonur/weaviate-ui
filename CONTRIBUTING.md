# Contributing to Weaviate Dashboard

Thank you for your interest in contributing to Weaviate Dashboard! This document provides guidelines for contributing to the project.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Git
- A running Weaviate instance for testing

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/weaviate-dashboard.git
   cd weaviate-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Weaviate configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Style

- **TypeScript**: Use strict TypeScript with proper type definitions
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code formatting is handled automatically
- **Components**: Use functional components with React hooks
- **Styling**: Use Tailwind CSS classes, avoid custom CSS when possible

### Component Structure

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  // Define props with proper TypeScript types
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    <div className="tailwind-classes">
      {/* Component JSX */}
    </div>
  );
}
```

### API Integration

- Use the centralized `weaviateClient` from `src/lib/api/weaviate.ts`
- Handle errors gracefully with user-friendly messages
- Show loading states for async operations
- Implement proper error boundaries

### State Management

- Use React hooks for local state
- Keep state as close to where it's needed as possible
- Use proper TypeScript types for state

## Contributing Process

### 1. Planning

- **Check existing issues** before starting work
- **Create an issue** for new features or significant changes
- **Discuss implementation** approach in the issue

### 2. Development

- **Create a feature branch** from `main`
  ```bash
  git checkout -b feature/your-feature-name
  ```

- **Make your changes** following the guidelines above
- **Write tests** for new functionality (when applicable)
- **Update documentation** if needed

### 3. Testing

- **Test your changes** with a real Weaviate instance
- **Check TypeScript compilation**
  ```bash
  npm run type-check
  ```
- **Run linting**
  ```bash
  npm run lint
  ```
- **Test the build**
  ```bash
  npm run build
  ```

### 4. Submitting

- **Commit your changes** with descriptive messages
  ```bash
  git commit -m "feat: add new feature description"
  ```

- **Push to your fork**
  ```bash
  git push origin feature/your-feature-name
  ```

- **Create a Pull Request** with:
  - Clear description of changes
  - Screenshots for UI changes
  - Reference to related issues

## Commit Message Format

Use conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add connection testing functionality
fix: resolve GraphQL query syntax highlighting
docs: update installation instructions
style: improve component spacing
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of the code has been performed
- [ ] Code is properly commented
- [ ] Changes have been tested with a Weaviate instance
- [ ] TypeScript compilation passes without errors
- [ ] ESLint passes without errors

### PR Description

Include:

- **What**: Brief description of changes
- **Why**: Reason for the changes
- **How**: Implementation approach
- **Testing**: How the changes were tested
- **Screenshots**: For UI changes

### Review Process

- All PRs require at least one review
- Address review feedback promptly
- Keep PRs focused and atomic
- Rebase if needed to keep history clean

## Feature Requests

### Before Submitting

- Check if the feature already exists
- Search existing issues for similar requests
- Consider if the feature fits the project scope

### Creating Feature Requests

Use the feature request template and include:

- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've thought of
- **Additional context**: Screenshots, mockups, etc.

## Bug Reports

### Before Submitting

- Check if the bug has already been reported
- Test with the latest version
- Verify it's not a configuration issue

### Creating Bug Reports

Include:

- **Environment**: OS, browser, Node.js version
- **Weaviate version**: Which version of Weaviate you're using
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Console errors**: Any error messages

## Development Tips

### Working with Weaviate

- Use a local Weaviate instance for development
- Test with different schema configurations
- Test with both empty and populated databases
- Verify CORS settings if connecting to remote instances

### UI/UX Considerations

- Maintain responsive design
- Follow accessibility best practices
- Test with different screen sizes
- Ensure dark theme compatibility
- Keep loading states informative

### Performance

- Optimize API calls and avoid unnecessary requests
- Implement proper pagination for large datasets
- Use React.memo for expensive components
- Minimize bundle size

## Getting Help

- **Documentation**: Check the README and inline comments
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Weaviate Community**: Join the Weaviate Slack for Weaviate-specific questions

## Recognition

Contributors will be:

- Listed in the project's contributors
- Acknowledged in release notes for significant contributions
- Invited to participate in project decisions

Thank you for contributing to Weaviate Dashboard! 🎉