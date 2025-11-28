#!/bin/bash

# 🚨 Git History Cleaner Script
# This script removes exposed API key from Git history

set -e

echo "=================================================="
echo "🚨 GIT HISTORY CLEANER"
echo "=================================================="
echo ""
echo "⚠️  WARNING: This will rewrite Git history!"
echo "⚠️  Make sure you have a backup before proceeding."
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled."
    exit 1
fi

echo ""
echo "Step 1: Creating backup..."
BACKUP_DIR="$HOME/finpartner-ai-backup-$(date +%Y%m%d-%H%M%S)"
cp -r . "$BACKUP_DIR"
echo "✅ Backup created at: $BACKUP_DIR"

echo ""
echo "Step 2: Checking for BFG Repo-Cleaner..."
if ! command -v bfg &> /dev/null; then
    echo "⚠️  BFG not found. Installing..."
    if command -v brew &> /dev/null; then
        brew install bfg
    else
        echo "❌ Homebrew not found. Please install BFG manually:"
        echo "   Download from: https://rtyley.github.io/bfg-repo-cleaner/"
        exit 1
    fi
fi

echo ""
echo "Step 3: Cleaning API key from Git history..."
# Replace the exposed key with placeholder
bfg --replace-text <(echo 'AIzaSyDHclclZU5bTLlLRf4ALoAGQJs_g8F2eUY==>YOUR_API_KEY_HERE')

echo ""
echo "Step 4: Cleaning up Git repository..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "Step 5: Verifying cleanup..."
if git log --all --full-history -S 'AIzaSyDHclclZU5bTLlLRf4ALoAGQJs_g8F2eUY' | grep -q 'commit'; then
    echo "⚠️  WARNING: Key still found in history!"
    echo "Manual intervention required."
    exit 1
else
    echo "✅ API key successfully removed from Git history!"
fi

echo ""
echo "=================================================="
echo "✅ CLEANUP COMPLETE!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Review the changes: git log --oneline"
echo "2. Force push to GitHub: git push origin main --force"
echo "3. Delete old API key in Google Cloud Console"
echo "4. Create new API key"
echo "5. Update .env.local with new key"
echo ""
echo "⚠️  IMPORTANT: Force push will rewrite GitHub history."
echo "    Make sure no one else is working on this repo."
echo ""

