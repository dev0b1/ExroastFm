# ⚠️ Script Cleanup Guide

## The Problem: Duplicate Scripts

Your `scripts/` folder had 4 different template import systems (unnecessary duplication):

| File | Purpose | Status | Keep? |
|------|---------|--------|-------|
| `seed-templates.ts` | Simple hardcoded templates | ✅ Working | **✅ KEEP** |
| `import-templates-local.ts` | Reads from `templates-data.json` | ❌ Duplicate | ❌ DELETE |
| `import-templates.ts` | Supabase cloud storage | ❌ Not needed | ❌ DELETE |
| `template-cli.js` | CLI management tool | ❌ Not needed | ❌ DELETE |
| `generate-template-placeholders.js` | Creates test MP3s | ⏳ Optional | ⏳ OPTIONAL |
| `setup.sh` | Setup script | ⏳ Optional | ⏳ OPTIONAL |

---

## Why You Have Type Errors

The deleted scripts had type errors because:

1. **Wrong import paths** - Using `@/` aliases instead of relative paths
2. **Missing type declarations** - Not using `interface` properly  
3. **Unused dependencies** - Referencing packages not imported
4. **db connection issues** - Using wrong db import

**Example from `import-templates-local.ts`:**
```typescript
import { db } from './src/db';  // ❌ Wrong - relative path from scripts/
// Should be:
import db from '@/server/db';  // ✅ Correct - absolute alias
```

---

## What to Delete

Remove these files (they're duplicates):

```bash
rm scripts/import-templates-local.ts
rm scripts/import-templates.ts
rm scripts/template-cli.js
```

Or use VS Code: Right-click → Delete → Confirm

---

## What to Keep

### ✅ `scripts/seed-templates.ts` (THE MAIN ONE)

This is your template system. It:
- Reads hardcoded `TEMPLATE_DATA` array
- Seeds templates to PostgreSQL database
- Checks for duplicates
- Has no type errors
- Works perfectly

**How to use:**
```bash
npm run db:seed
```

**To update templates:**
1. Edit `TEMPLATE_DATA` in `seed-templates.ts`
2. Run `npm run db:seed`
3. Done!

### ⏳ Optional: `generate-template-placeholders.js`

Creates dummy MP3 files for testing. Keep if you want:
```bash
npm run templates:placeholders
```

### ⏳ Optional: `setup.sh`

One-command setup. Keep if you want, but not necessary.

---

## Updated package.json

After cleanup, you only need these scripts:

```json
{
  "scripts": {
    "dev": "next dev -p 5000 -H 0.0.0.0",
    "build": "next build",
    "start": "next start -p 5000 -H 0.0.0.0",
    "lint": "next lint",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx scripts/seed-templates.ts"
  }
}
```

Simple and clean! ✨

---

## How to Add/Update Templates

**Step 1:** Open `scripts/seed-templates.ts`

**Step 2:** Edit the `TEMPLATE_DATA` array:

```typescript
const TEMPLATE_DATA = [
  {
    filename: 'my-template.mp3',
    keywords: 'keyword1, keyword2, keyword3',
    mode: 'roast',        // or 'glowup'
    mood: 'petty',        // or other mood
    storageUrl: '/templates/my-template.mp3',
    title: 'My Template',
    description: 'Description of the template',
  },
  // ... more templates
];
```

**Step 3:** Run seed:

```bash
npm run db:seed
```

**Step 4:** Check results:

```bash
npm run dev
# Test in app
```

Done! 🎵

---

## Why This Is Better

✅ **No duplicates** - One source of truth
✅ **No type errors** - Clean TypeScript
✅ **Simple to update** - Just edit the array
✅ **Easy to understand** - All in one file
✅ **No external dependencies** - Works standalone

---

## Files to Delete (Optional UI Cleanup)

If you want a cleaner project, delete these too:

- `templates-data.json` - No longer needed
- `TEMPLATE_SETUP.md` - Old documentation
- `TEMPLATE_SETUP_READY.sh` - Old documentation
- `TEMPLATE_SETUP_SUMMARY.txt` - Old documentation
- `ANSWER_YOUR_QUESTION.md` - Old documentation
- `TEMPLATES_QUICK_REFERENCE.md` - Old documentation
- `TEMPLATE_IMPORT_GUIDE.md` - Old documentation
- `LOCAL_VS_SUPABASE.md` - Old documentation
- `YOUR_QUESTION_ANSWERED.md` - Old documentation

These were for the old multi-script system. Now you just have `seed-templates.ts`.

---

## Quick Summary

### Before (Messy)
```
scripts/
├── seed-templates.ts (hardcoded)
├── import-templates-local.ts (reads JSON)
├── import-templates.ts (reads JSON + uploads)
├── template-cli.js (CLI tool)
└── 6 documentation files (confusing)
```

### After (Clean)
```
scripts/
├── seed-templates.ts ✅ (only one needed)
└── (optional) generate-template-placeholders.js
```

---

## Your New Template System

All you need to do:

1. **Edit templates** in `scripts/seed-templates.ts`
2. **Run seed** with `npm run db:seed`
3. **Use app** with `npm run dev`

Simple! No confusion. No duplicates. No type errors. ✨

