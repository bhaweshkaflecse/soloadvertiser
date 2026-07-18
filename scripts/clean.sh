#!/bin/bash
# Solo Advertiser — Clean Script
# Removes all build artifacts and node_modules

set -e

echo "🧹 Cleaning build artifacts..."

# Remove dist directories
find . -name "dist" -type d -not -path "./node_modules/*" -exec rm -rf {} + 2>/dev/null || true

# Remove .next directories
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove coverage directories
find . -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove node_modules
echo "🗑️  Removing node_modules..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove turbo cache
rm -rf .turbo 2>/dev/null || true

echo "✅ Clean complete. Run 'pnpm install' to reinstall dependencies."
