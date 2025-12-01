#!/bin/bash

# ExRoast.buzz - Quick Start Setup
# This script sets up the auth + templates system

set -e

echo "🚀 ExRoast.buzz - Quick Start Setup"
echo "=================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js @supabase/ssr --silent
echo "✅ Dependencies installed"
echo ""

# Step 2: Generate template placeholders
echo "🎵 Step 2: Generating template placeholders..."
npm run templates:placeholders
echo "✅ Template files created in public/templates/"
echo ""

# Step 3: Seed templates to database
echo "🌱 Step 3: Seeding templates to database..."
npm run db:seed
echo "✅ Templates seeded to database"
echo ""

# Step 4: Summary
echo "✨ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Replace placeholder MP3 files in public/templates/ with real audio"
echo "   2. Run: npm run dev"
echo "   3. Visit: http://localhost:5000/pricing"
echo "   4. Click 'Subscribe' to test auth + checkout flow"
echo ""
echo "📚 Documentation:"
echo "   - IMPLEMENTATION.md  - Complete setup guide"
echo "   - TEMPLATE_SETUP.md  - Template instructions"
echo "   - DEEP_DIVE.md       - Architecture overview"
echo ""
echo "🔧 Useful Commands:"
echo "   npm run dev                    - Start dev server"
echo "   npm run templates:placeholders - Create new template placeholders"
echo "   npm run db:seed               - Seed templates to database"
echo ""
echo "💬 To get help:"
echo "   - Check IMPLEMENTATION.md section 9 (Troubleshooting)"
echo "   - Review TEMPLATE_SETUP.md FAQ"
echo ""
