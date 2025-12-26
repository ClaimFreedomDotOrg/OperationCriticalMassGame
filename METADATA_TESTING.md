# Testing Social Media Metadata

This document explains how to test the social media metadata after deployment.

## What Was Added

The site now includes comprehensive metadata for:
- **Open Graph** (Facebook, LinkedIn, Discord, etc.)
- **Twitter Cards**
- **SEO** (Search engines)
- **Structured Data** (Google Rich Results)
- **Mobile Web Apps** (iOS)

## Testing Tools

After the site is deployed, test the metadata using these official tools:

### 1. Facebook Sharing Debugger
**URL:** https://developers.facebook.com/tools/debug/

**Steps:**
1. Enter your site URL: `https://tamethedemon.com/`
2. Click "Debug"
3. Review the preview card

**What to check:**
- ✅ Title: "Operation: Critical Mass - Collective Consciousness Game"
- ✅ Description shows neuroscience/multiplayer message
- ✅ Image displays correctly (1200x630px)
- ✅ Image alt text is present

**Note:** If you don't see updates, click "Scrape Again" to refresh Facebook's cache.

---

### 2. Twitter Card Validator
**URL:** https://cards-dev.twitter.com/validator

**Steps:**
1. Enter your site URL: `https://tamethedemon.com/`
2. Click "Preview card"

**What to check:**
- ✅ Card type: "Summary Card with Large Image"
- ✅ Title and description match
- ✅ Image displays properly
- ✅ No validation errors

---

### 3. LinkedIn Post Inspector
**URL:** https://www.linkedin.com/post-inspector/

**Steps:**
1. Enter your site URL: `https://tamethedemon.com/`
2. Click "Inspect"

**What to check:**
- ✅ Preview shows title, description, and image
- ✅ Image is clear and high quality
- ✅ No errors or warnings

---

### 4. Google Rich Results Test
**URL:** https://search.google.com/test/rich-results

**Steps:**
1. Enter your site URL: `https://tamethedemon.com/`
2. Click "Test URL"
3. Review structured data

**What to check:**
- ✅ "WebApplication" schema detected
- ✅ No errors in structured data
- ✅ All fields populated correctly

---

### 5. Meta Tags Checker (General)
**URL:** https://metatags.io/

**Steps:**
1. Enter your site URL: `https://tamethedemon.com/`
2. Review all metadata across platforms

**What to check:**
- ✅ Previews for Google, Facebook, Twitter, LinkedIn
- ✅ All tags present and correct
- ✅ Images load properly

---

## Manual Testing

### Test Social Sharing
1. Share the URL on Facebook, Twitter, LinkedIn
2. Verify the preview card appears correctly
3. Check that the image is not cropped oddly
4. Confirm description is compelling and accurate

### Test Search Results
1. Search for "Operation Critical Mass" on Google
2. Check if rich snippets appear (may take time to index)
3. Verify title and description in search results

### Test Mobile
1. Open the site on iOS Safari
2. Tap "Share" → "Add to Home Screen"
3. Verify the app icon and title

---

## Expected Metadata Values

### Title
```
Operation: Critical Mass - Collective Consciousness Game
```

### Description
```
A neuroscience-based multiplayer experience for thousands. Synchronize with others in real-time to achieve collective coherence. Browser-based, zero installation. The Body is One.
```

### Image
- **URL:** `https://tamethedemon.com/og-image.png`
- **Dimensions:** 1200x630px
- **Size:** ~179 KB
- **Content:** Shows transformation from chaos (red cells) to coherence (gold cells)

### Keywords
```
collective consciousness, neuroscience game, multiplayer coherence, meditation game, bilateral stimulation, EMDR, mindfulness, synchronization, browser game
```

---

## Troubleshooting

### Image Not Appearing
1. **Check image URL:** Ensure `og-image.png` is accessible at root
2. **Use absolute URL:** Must be `https://` not relative path
3. **Clear cache:** Use "Scrape Again" in Facebook debugger
4. **Check file size:** Should be under 8MB (ours is 179KB ✅)

### Wrong Preview Showing
1. **Clear platform cache:** Use respective debugging tools
2. **Wait 24-48 hours:** Some platforms cache aggressively
3. **Verify HTML:** Check `<head>` section has all meta tags

### Structured Data Errors
1. Run Google Rich Results Test
2. Fix any validation errors in JSON-LD
3. Re-test after deployment

---

## Quick Validation Checklist

After deployment, quickly verify:

- [ ] Homepage loads correctly
- [ ] `/og-image.png` is accessible
- [ ] View page source - all meta tags present in `<head>`
- [ ] Facebook debugger shows correct preview
- [ ] Twitter validator shows correct card
- [ ] LinkedIn inspector shows correct preview
- [ ] Google test shows valid structured data
- [ ] Mobile "Add to Home Screen" works

---

## Files Changed

- **`index.html`** - Added all metadata tags
- **`public/og-image.png`** - Social media preview image (1200x630px)

---

## Need Help?

If metadata isn't working after deployment:
1. Check browser console for errors
2. Verify image URL is accessible
3. Use debugging tools above to identify issues
4. Check `index.html` source in production
5. Clear CDN/browser caches if using them

---

*Last updated: 2025-12-25*
