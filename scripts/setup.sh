#!/bin/bash
# Solo Advertiser — Development Setup Script
# Run this script after cloning the repository.

set -e

echo "🚀 Solo Advertiser — Development Setup"
echo "======================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 20.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be >= 20.0.0 (current: $(node -v))"
    exit 1
fi
echo "✅ Node.js $(node -v)"

if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi
echo "✅ pnpm $(pnpm -v)"

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You won't be able to run local services."
else
    echo "✅ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
else
    echo "ℹ️  .env already exists, skipping"
fi

echo ""
echo "🐳 Starting local services (PostgreSQL + Redis)..."
if command -v docker &> /dev/null; then
    docker compose -f docker-compose.dev.yml up -d
    echo "✅ Services started"
else
    echo "⚠️  Skipping Docker services (Docker not available)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  pnpm dev        — Start all services in development mode"
echo "  pnpm build      — Build all packages and apps"
echo "  pnpm typecheck  — Run TypeScript type checking"
echo "  pnpm lint       — Run ESLint across the monorepo"
echo "  pnpm test       — Run all tests"
echo ""
