#!/bin/bash
set -e

echo "Starting setup..."

# 1. Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# 2. Install Python dependencies for the readiness check
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Setup complete. You can now run:"
echo "  npm run dev"
echo "  python3 antigravity_check.py"
