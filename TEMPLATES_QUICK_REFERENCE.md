# 🎯 Template Setup - Quick Reference

## Your Question Answered

> "I want to add all MP3s and metadata in a file locally so you can help me upload to DB? Or is uploading to Supabase directly better?"

### Answer
✅ **Use LOCAL JSON + Import Script** (what I built)
- Store template metadata in `templates-data.json`
- Store MP3 files in `public/templates/`
- Import both to database with one command

Later: Move to **Supabase** for production scale (50+ templates)

---

## 📊 System Overview

```
Your Setup:
┌─────────────────────────────────────────────────────┐
│                                                       │
│  templates-data.json (template metadata)            │
│         ↓                                             │
│  public/templates/ (MP3 files)                       │
│         ↓                                             │
│  npm run templates:import (import script)            │
│         ↓                                             │
│  PostgreSQL Database (saved templates)               │
│         ↓                                             │
│  Your App (matches user input to templates)          │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 3-Step Setup

### Step 1: Create Test MP3s (1 min)
```bash
npm run templates:placeholders
```
✓ Creates 5 placeholder MP3 files in `public/templates/`

### Step 2: Import to Database (1 min)
```bash
npm run templates:import
```
✓ Reads `templates-data.json` + imports to DB

### Step 3: Verify (30 sec)
```bash
npm run templates:list
```
✓ Shows all imported templates

**Total: 2.5 minutes** ⚡

---

## 📁 What I Created For You

| File | Purpose |
|------|---------|
| `templates-data.json` | Template metadata config (edit this!) |
| `scripts/import-templates-local.ts` | Local import script |
| `scripts/import-templates.ts` | Supabase import script (use later) |
| `scripts/template-cli.js` | CLI tool for managing templates |
| `TEMPLATE_IMPORT_GUIDE.md` | Detailed guide (50+ sections) |
| `LOCAL_VS_SUPABASE.md` | Decision guide |

---

## 🎵 Template Data Structure

```json
{
  "templates": [
    {
      "filename": "petty.mp3",           ← MP3 filename
      "title": "Petty & Petulant",       ← Display name
      "keywords": "petty, sarcasm, ...",  ← For matching
      "mode": "petty",                    ← petty|sad|healing|savage|vibe
      "mood": "sarcastic",                ← sarcastic|melancholic|hopeful|aggressive|upbeat
      "duration": 35,                     ← Seconds
      "storageUrl": "templates/petty.mp3" ← URL in app
    }
  ]
}
```

---

## 🔄 Typical Workflow

### For MVP (Now)
```
1. npm run templates:placeholders   (test MP3s)
2. npm run templates:import         (import to DB)
3. Get real MP3 files
4. Replace placeholders in public/templates/
5. npm run templates:import         (re-import)
6. Test in app
```

### For Production (Later)
```
1. npm run templates:import-supabase  (uses cloud)
2. MP3s upload to Supabase
3. URLs saved to database
4. App serves from CDN
```

---

## ⚡ Command Reference

```bash
# View templates
npm run templates:list              # List all
npm run templates:stats             # Statistics
npm run templates:validate          # Check errors

# Manage templates
npm run templates:add               # Interactive add
npm run templates:placeholders      # Create test MP3s

# Import to database
npm run templates:import            # Local import
npm run templates:import-supabase   # Supabase import

# Development
npm run dev                         # Start app
npm run db:push                     # Push schema to DB
```

---

## 🎯 Local vs Supabase: Decision Matrix

| Use Case | Method | Reason |
|----------|--------|--------|
| **Testing** | Local | Fast, no setup |
| **MVP launch** | Local | Free, simple |
| **5-20 templates** | Local | Sufficient |
| **20-50 templates** | Local | Still OK |
| **50+ templates** | Supabase | Scale, CDN |
| **Global users** | Supabase | CDN needed |
| **Production** | Supabase | Professional |

---

## 📝 Editing templates-data.json

### To Change Template Title:
```json
{
  "title": "My New Title"  ← Change this
}
```

### To Change Keywords:
```json
{
  "keywords": "word1, word2, word3, word4, word5"
}
```

### To Add New Template:
1. Edit `templates-data.json`
2. Add new object to `templates` array
3. Save
4. Run: `npm run templates:import`

---

## 🧪 Test It Works

```bash
# 1. Create test data
npm run templates:placeholders

# 2. Import to database
npm run templates:import

# 3. Check in database
npm run templates:list

# 4. Start app
npm run dev

# 5. Visit http://localhost:5000/story
# 6. Enter a story (e.g., "He cheated")
# 7. Should show template preview
```

---

## 💾 Database Schema

```typescript
templates {
  id: UUID (auto)
  filename: string         ← "petty.mp3"
  keywords: string         ← "petty, sarcasm, ..."
  mode: string            ← "petty"
  mood: string            ← "sarcastic"
  storageUrl: string      ← "/templates/petty.mp3"
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 🎵 Keyword Matching Example

**User Input:** "He cheated and I'm angry"

**Algorithm:**
1. Split to words: ["he", "cheated", "and", "i'm", "angry"]
2. Compare to template keywords
3. Find similarity scores
4. Return best match

**Result:** `petty.mp3` (has keywords: "petty, call out, annoyed")

---

## ⚙️ How to Scale

### Phase 1: MVP (Now)
```
5 templates
Local storage
Free
```

### Phase 2: Growth (2-4 weeks)
```
20-30 templates
Still local (or switch to Supabase)
~$0-5/mo
```

### Phase 3: Production (Month 2+)
```
50+ templates
Supabase storage
~$5-20/mo
```

---

## 🔑 Important Notes

✅ `templates-data.json` is your source of truth
✅ Keep it in version control
✅ MP3 filenames must match JSON config
✅ Keywords used for matching (critical!)
✅ Validate before importing: `npm run templates:validate`
✅ Local mode: files served from `public/templates/`
✅ Supabase mode: files served from Supabase CDN

---

## 📞 If You Get Stuck

### "Import not finding MP3s"
→ Run: `npm run templates:placeholders`

### "Templates not in app"
→ Check: `npm run templates:list`

### "Keyword matching not working"
→ Try exact keywords from config

### "Want cloud storage?"
→ Read: `LOCAL_VS_SUPABASE.md` (section: Supabase)

### "Need help?"
→ Read: `TEMPLATE_IMPORT_GUIDE.md` (detailed guide)

---

## ✨ You're Ready!

What you have:
- ✅ `templates-data.json` (template config)
- ✅ Import scripts (local & Supabase)
- ✅ CLI tool (manage templates)
- ✅ Database schema (ready to go)
- ✅ Complete documentation

What to do next:
1. Run: `npm run templates:placeholders`
2. Run: `npm run templates:import`
3. Get real MP3 files
4. Replace placeholders
5. Run import again
6. Test in app!

---

## 🎯 One-Liner Quick Start

```bash
npm run templates:placeholders && npm run templates:import && npm run templates:list
```

This:
1. Creates test MP3s
2. Imports to database
3. Shows what was imported

Done! ✨

