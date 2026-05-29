#!/bin/bash

echo "🚀 Nilaya AI Deployment Script"
echo "=============================="
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "📝 Changes detected. Let's deploy!"
    echo ""
    
    # Show changes
    echo "📋 Files changed:"
    git status -s
    echo ""
    
    # Add all changes
    echo "📦 Adding changes..."
    git add .
    
    # Commit
    commit_msg=${1:-"chore: deploy latest site updates"}
    
    echo "💾 Committing: $commit_msg"
    git commit -m "$commit_msg"
    
    # Push
    echo "🚀 Pushing to GitHub..."
    git push origin main
    
    echo ""
    echo "✅ Deployment initiated!"
    echo "⏱️  Netlify will deploy in 2-3 minutes"
    echo "🔗 Check: https://app.netlify.com/"
    echo ""
else
    echo "✅ No changes to deploy!"
    echo "Everything is up to date."
fi
