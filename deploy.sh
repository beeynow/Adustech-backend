#!/bin/bash

echo "🚀 Deploying Backend Fixes to Production..."
echo ""
echo "This will fix all 500 errors by deploying:"
echo "  ✅ User model with @default(cuid())"
echo "  ✅ Post model fixes"
echo "  ✅ All relation name fixes"
echo ""

# Check if git is configured
if ! git config user.email > /dev/null 2>&1; then
    echo "⚙️  Configuring git..."
    git config user.email "developer@adustech.com"
    git config user.name "ADUSTECH Developer"
fi

# Show what will be pushed
echo "📋 Commits to be deployed:"
git log origin/main..HEAD --oneline
echo ""

# Push to GitHub
echo "🔄 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "⏱️  Vercel will auto-deploy in 2-3 minutes"
    echo ""
    echo "🧪 Test after deployment:"
    echo "   curl https://adustech-backend.vercel.app/api/posts"
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "If authentication failed, use Personal Access Token:"
    echo "  1. Go to: https://github.com/settings/tokens"
    echo "  2. Generate new token (classic)"
    echo "  3. Select scope: repo"
    echo "  4. Use token as password when prompted"
fi

