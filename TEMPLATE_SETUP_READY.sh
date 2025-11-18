#!/bin/bash

cat << 'EOF'

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🎵 BREAKUP MUSIC - TEMPLATE SYSTEM SETUP COMPLETE 🎵      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

📦 TWO OPTIONS FOR ADDING TEMPLATES:

  OPTION 1: LOCAL STORAGE (Recommended for MVP)
  ════════════════════════════════════════════
  ✅ Simple setup (2 min)
  ✅ No cloud config needed
  ✅ Perfect for 5-50 templates
  ✅ FREE
  
  Steps:
    1. npm run templates:placeholders    (create test MP3s)
    2. npm run templates:import          (import to DB)
    3. npm run templates:list            (verify)
  
  Then add real MP3 files to: public/templates/


  OPTION 2: SUPABASE STORAGE (For production scale)
  ══════════════════════════════════════════════════
  ✅ Cloud backup (automatic)
  ✅ Global CDN (faster delivery)
  ✅ Scale to 1000+ templates
  ✅ ~$5/month
  
  Steps:
    1. Create bucket in Supabase (Storage → templates)
    2. npm run templates:import-supabase
    3. Files auto-uploaded to cloud

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 FILES CREATED:

  templates-data.json               ← Your template metadata (JSON)
  scripts/import-templates-local.ts  ← Local import script
  scripts/import-templates.ts        ← Supabase import script
  scripts/template-cli.js            ← CLI management tool
  TEMPLATE_IMPORT_GUIDE.md           ← Detailed guide
  LOCAL_VS_SUPABASE.md               ← Decision guide


📝 TEMPLATE CONFIG:

  templates-data.json contains:
  {
    "templates": [
      {
        "filename": "petty.mp3",
        "title": "Petty & Petulant",
        "keywords": "petty, sarcasm, attitude, sass",
        "mode": "petty",
        "mood": "sarcastic",
        "duration": 35
      },
      ...
    ]
  }

  Edit this file to customize templates ↑


🎯 QUICK START (5 minutes):

  1. Create test MP3 files:
     $ npm run templates:placeholders

  2. Import to database:
     $ npm run templates:import

  3. View your templates:
     $ npm run templates:list

  4. Check statistics:
     $ npm run templates:stats

  5. Validate configuration:
     $ npm run templates:validate


📊 TEMPLATE MANAGEMENT COMMANDS:

  npm run templates:placeholders      Create test MP3 files
  npm run templates:import            Import to local DB
  npm run templates:import-supabase   Import to Supabase
  npm run templates:list              List all templates
  npm run templates:stats             Show statistics
  npm run templates:validate          Validate config
  npm run templates:add               Add new template (interactive)


🔄 WORKFLOW: Add More Templates Later

  Step 1: Edit templates-data.json
    - Add new template entry
    - Set filename, keywords, mode, mood

  Step 2: Add MP3 file
    - Save to public/templates/your-file.mp3

  Step 3: Import
    - npm run templates:import

  ✓ Done! New templates available in your app


🧪 TEST IN APP:

  $ npm run dev

  Visit: http://localhost:5000/story

  Try entering stories:
    • "He cheated on me"     → Should match petty template
    • "I miss him so much"   → Should match sad template
    • "I'm ready to move on" → Should match healing template

  The app will:
    1. Match story to template by keywords
    2. Play 15-second preview
    3. Show upsell after preview


🎵 ABOUT TEMPLATES-DATA.JSON:

  This is your central config file!

  Current Templates:
    • petty.mp3  - Petty & Petulant (sarcastic)
    • sad.mp3    - Sad & Emotional (melancholic)
    • healing.mp3 - Healing & Empowerment (hopeful)
    • savage.mp3 - Savage & Bold (aggressive)
    • vibe.mp3   - Good Vibes Only (upbeat)

  How to Edit:
    1. Open templates-data.json
    2. Change "filename" to your MP3 names
    3. Update "keywords" (comma-separated words)
    4. Set "mode": petty | sad | healing | savage | vibe
    5. Set "mood": sarcastic | melancholic | hopeful | aggressive | upbeat
    6. Save and run: npm run templates:import


💡 RECOMMENDATION:

  ✅ Use LOCAL for now (2 min setup, free)
  
  Later, when you have:
    • 50+ templates
    • Real production audio
    • Need global CDN
  
  Then move to SUPABASE (5 min setup, $5/mo)


🚀 NEXT STEPS:

  [ ] Run: npm run templates:placeholders
  [ ] Run: npm run templates:import
  [ ] Run: npm run templates:list (verify)
  [ ] Find real MP3 files (30-35 seconds each)
  [ ] Replace placeholders in public/templates/
  [ ] Edit templates-data.json with real filenames
  [ ] Re-run: npm run templates:import
  [ ] Test in app: npm run dev
  [ ] Add more templates as needed


📚 READ THESE DOCS:

  Priority 1: LOCAL_VS_SUPABASE.md
    → Decision guide (which option to use)

  Priority 2: TEMPLATE_IMPORT_GUIDE.md
    → Complete import instructions

  Priority 3: IMPLEMENTATION.md
    → Full setup reference


🔑 KEY FILES:

  templates-data.json          ← Template metadata
  public/templates/            ← MP3 storage
  src/db/schema.ts             ← Database schema
  scripts/import-templates-local.ts  ← Import logic
  lib/template-matcher.ts      ← Keyword matching


⚡ IMPORTANT NOTES:

  • templates-data.json is your source of truth
  • MP3 files need to match filenames in JSON
  • Keywords are used for matching user input
  • Local mode uses 'public/templates/', Supabase uses cloud
  • Keep templates-data.json in version control
  • Validate before importing: npm run templates:validate


❓ TROUBLESHOOTING:

  Q: "MP3 file not found" error?
  A: Create placeholders: npm run templates:placeholders
     Or add real MP3 files to: public/templates/

  Q: "Templates not showing in app"?
  A: Check: npm run templates:list
     Verify keywords match user input
     Try entering exact keywords

  Q: "Want to use Supabase instead?"
  A: Read LOCAL_VS_SUPABASE.md (section: "Use Supabase")
     Follow 5-minute setup

  Q: "How to add more templates?"
  A: Edit templates-data.json → Add MP3 → Run import


✨ YOU'RE ALL SET!

  Everything is configured. Now:

  1. Create/find real MP3 files
  2. Run: npm run templates:import
  3. Test in app
  4. Add more templates as needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? See documentation:
  • LOCAL_VS_SUPABASE.md - Which method to use
  • TEMPLATE_IMPORT_GUIDE.md - Step-by-step guide
  • IMPLEMENTATION.md - Full reference

Ready to test?
  $ npm run templates:list
  $ npm run dev

EOF

