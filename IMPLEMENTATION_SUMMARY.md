# Implementation Summary: English Flag Origin Information Extraction

## Issue
20 countries were missing flag origin information in the English version of the learning mode.

## Root Cause
The `getFlagDescription` function in `scripts/generate-data.mts` constructed Wikipedia page names incorrectly for countries with special prefixes like "the", "Republic of", "Democratic Republic of", etc.

For example:
- "United States" → looked for "Flag of United States" but should be "Flag of the United States"
- "Republic of Ireland" → looked for "Flag of Republic of Ireland" but should be "Flag of Ireland"

## Solution Implemented

### 1. Country Name Normalization
Added `normalizeFlagPageName()` function that generates multiple Wikipedia page name variations:
- Original name: "Flag of [Country]"
- With/without "the": "Flag of the [Country]"
- Without prefixes like "Republic of", "Democratic Republic of", "Federated States of", etc.

The function tries each variation until it finds an existing Wikipedia page.

### 2. HTML Sanitization
Added `cleanHtmlText()` function that:
- Removes all HTML tags (including `<a>`, `<script>`, `<style>`, etc.)
- Removes citation annotations: [1], [2], [[1]], [[2]], [citation needed], etc.
- Decodes HTML entities: &amp; → &, &nbsp; → space, etc.
- Normalizes whitespace
- Prevents double-escaping issues

### 3. Improved Flag Description Extraction
Modified `getFlagDescription()` function to:
- Generate multiple page name variations
- Check if each page exists before trying to fetch content
- Use HTML extracts (not plain text) for better cleaning
- Provide detailed logging of which page was found

### 4. Security
- Addressed CodeQL security alerts
- Added comments explaining why the code is safe
- Entity decoding order prevents double-escaping
- Output stored in JSON (not rendered as HTML)
- Added tests for malicious HTML handling

## Files Modified

1. **scripts/generate-data.mts**
   - Added `cleanHtmlText()` function (24 lines)
   - Added `normalizeFlagPageName()` function (39 lines)
   - Improved `getFlagDescription()` function (62 lines)

2. **scripts/__tests__/generate-data.test.ts** (NEW)
   - 21 comprehensive tests covering all edge cases
   - Tests for all 20 problematic countries
   - Security tests for HTML/XSS handling

3. **README.md**
   - Added documentation about country name normalization
   - Added instructions for updating specific countries
   - Explained the improvements made

4. **docs/flag-origin-extraction-guide.md** (NEW)
   - Comprehensive usage guide
   - Lists all 20 problematic countries
   - Step-by-step instructions
   - Troubleshooting section

5. **TODO.md**
   - Updated to reflect completed improvements

## Test Results
- All 148 tests pass ✅
- 21 new tests added for flag extraction functions
- Test coverage includes:
  - HTML cleaning with various formats
  - Country name normalization for all problematic countries
  - Integration with real Wikipedia HTML extracts
  - Security scenarios (malicious HTML, double-encoding)

## Next Steps (User Action Required)

**⚠️ IMPORTANT: The code improvements are complete, but the data files need to be regenerated.**

Since Wikipedia access was blocked in the sandboxed environment, the actual data regeneration needs to be performed by the user in their local environment:

### How to Regenerate Data

1. **For all countries with missing English descriptions:**
   ```bash
   # This will take 30-60 minutes
   npm run batch:create-data
   ```

2. **For specific countries only:**
   ```bash
   npm run batch:create-data "United States"
   npm run batch:create-data "Ireland"
   npm run batch:create-data "United Kingdom"
   # ... repeat for other countries
   ```

3. **Verify the results:**
   ```bash
   # Check how many countries still have empty descriptions
   jq '[.[] | select(.description == "")] | length' public/countries.en.json
   
   # Check a specific country
   jq '.[] | select(.id == "united_states") | .description' public/countries.en.json
   ```

### Expected Console Output
When the script successfully extracts flag information, you should see:
```
Processing アメリカ合衆国...
  ✓ Capital (EN): Washington, D.C.
  ✓ Continent (EN): North America
  ✓ Map image found
  ✓ Found flag page: "Flag of the United States"
  ✓ Flag description (en): 1234 chars
  ✓ Updated United States in countries.en.json
  ✓ Saved to files (Total: 195 countries)
```

### Countries That Need Updating
The following 20 countries need their English flag descriptions regenerated:
- Republic of Ireland
- United States
- United Arab Emirates
- United Kingdom
- Netherlands
- The Gambia
- Cook Islands
- Comoros
- Republic of the Congo
- Democratic Republic of the Congo
- Czech Republic
- Central African Republic
- Taiwan
- Denmark
- Dominican Republic
- The Bahamas
- Philippines
- Marshall Islands
- Federated States of Micronesia
- Maldives

## Verification Checklist

After running the batch script, verify:
- [ ] All 148 tests still pass: `npm test`
- [ ] No countries have empty descriptions: `jq '[.[] | select(.description == "")] | length' public/countries.en.json` returns 0
- [ ] Descriptions are clean (no HTML tags, no citations): manually check a few countries
- [ ] Learning mode displays flag descriptions correctly in both English and Japanese
- [ ] No console errors when viewing the learning mode

## Documentation References

- **Usage Guide**: `docs/flag-origin-extraction-guide.md`
- **README**: See "国データの生成" section
- **Tests**: `scripts/__tests__/generate-data.test.ts`

## Summary

The code improvements are complete and tested. The batch script is now capable of:
- ✅ Handling countries with complex names (prefixes, "the", etc.)
- ✅ Extracting clean, well-formatted descriptions from Wikipedia
- ✅ Removing all HTML tags and citation annotations
- ✅ Being secure against HTML injection and double-escaping

The only remaining step is to **run the batch script with Wikipedia access** to actually regenerate the data files.
