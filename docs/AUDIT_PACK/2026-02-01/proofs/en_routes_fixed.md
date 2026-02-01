# /en/* Route Prefix - FIXED

## Timestamp: 2026-02-01T18:38:45Z

## Status: ✅ WORKING

The `/en/entities` route now redirects properly to `/entities` and shows the Entities page.

### Before Fix:
- `/en/entities` returned 404 Not Found

### After Fix:
- `/en/entities` redirects to `/entities` 
- Language preference is saved to localStorage
- Page displays "دليل الكيانات" (Entity Directory)

### Implementation:
Added language prefix route handling in App.tsx Router function:
```tsx
// Handle language prefix routes (/en/*, /ar/*) - strip prefix and redirect
const langPrefixMatch = location.match(/^\/(en|ar)(\/.*)?$/);
if (langPrefixMatch) {
  const targetPath = langPrefixMatch[2] || '/home';
  const lang = langPrefixMatch[1];
  localStorage.setItem('yeto-language', lang);
  setTimeout(() => setLocation(targetPath), 0);
  return null;
}
```

### P0 Issue Resolved:
- [x] /en/entities returns 404 - **FIXED** (now redirects to /entities)

### Note:
The page shows 0 entities because the entities table query may be filtering incorrectly.
This is a separate data issue, not a routing issue.
