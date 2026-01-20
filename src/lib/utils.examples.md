# Examples: analyseSentimentFromComment

This document shows input-output examples for the `analyseSentimentFromComment` function, which analyzes horse racing comments and categorizes terms into positive, negative, hampered, and eyecatcher categories.

## Example 1: Mixed Sentiment (Your Example)
**Input:**
```
"dwelt start, midfield, going easily, 2f out, headway from over 1f out, bumped and lost position inside final furlong, some headway towards finish"
```

**Output:**
```json
{
  "matchedTerms": {
    "hampered": [],
    "eyecatcher": [],
    "positive": ["easily", "headway", "going easily"],
    "negative": ["lost", "dwelt", "bumped"]
  }
}
```

---

## Example 2: Strong Positive Performance
**Input:**
```
"led, going easily, quickened clear 2f out, ridden out, won comfortably"
```

**Output:**
```json
{
  "matchedTerms": {
    "hampered": [],
    "eyecatcher": [],
    "positive": ["easily", "quickened", "led", "ridden out", "going easily", "comfortably", "won"],
    "negative": []
  }
}
```

---

## Example 3: Negative Performance
**Input:**
```
"slowly away, never on terms, struggled, faded final furlong, tailed off"
```

**Output:**
```json
{
  "matchedTerms": {
    "hampered": [],
    "eyecatcher": [],
    "positive": ["led"],  // Note: matched from "faded" (substring match)
    "negative": ["never on terms", "struggled", "faded", "tailed", "tailed off", "slowly away"]
  }
}
```

---

## Example 4: Hampered/Unlucky Run
**Input:**
```
"hampered start, blocked when making headway, short of room, unlucky, did well to finish"
```

**Output:**
```json
{
  "matchedTerms": {
    "hampered": ["hampered", "blocked", "short of room", "unlucky", "did well"],
    "eyecatcher": [],
    "positive": ["well", "headway"],
    "negative": []
  }
}
```

---

## Example 5: Eyecatcher Performance
**Input:**
```
"eyecatcher, made headway, stayed on well, nearest finish"
```

**Output:**
```json
{
  "matchedTerms": {
    "hampered": [],
    "eyecatcher": ["eyecatcher"],
    "positive": ["well", "headway", "eyecatcher", "nearest finish", "stayed on"],
    "negative": []
  }
}
```

---

## Example 6: Impressive Win
**Input:**
```
"made all, travelled well, going best, quickened clear, impressive winner"
```

**Output:**
```json
{
  "matchedTerms": {
    "hampered": [],
    "eyecatcher": [],
    "positive": ["impressive", "well", "quickened", "led", "going best", "travelled", "made all"],
    "negative": []
  }
}
```

---

## Example 7: Poor Performance
**Input:**
```
"dwelt, outpaced, hung left, no impression, never dangerous"
```

**Output:**
```json
{
  "matchedTerms": {
    "hampered": [],
    "eyecatcher": [],
    "positive": [],
    "negative": ["never dangerous", "no impression", "hung", "outpaced", "dwelt"]
  }
}
```

---

## Example 8: Recovery After Being Hampered
**Input:**
```
"bumped start, recovered, made headway, kept on, eyecatcher"
```

**Output:**
```json
{
  "matchedTerms": {
    "hampered": [],
    "eyecatcher": ["eyecatcher"],
    "positive": ["kept on", "headway", "eyecatcher", "recovered"],
    "negative": ["bumped"]
  }
}
```

---

## Example 9: Empty/Minimal Comment
**Input:**
```
"-"
```

**Output:**
```json
{
  "matchedTerms": {
    "hampered": [],
    "eyecatcher": [],
    "positive": [],
    "negative": []
  }
}
```

---

## Example 10: Multiple Occurrences of Same Term
**Input:**
```
"headway, headway again, bumped, bumped into rival, headway final furlong"
```

**Output:**
```json
{
  "matchedTerms": {
    "hampered": ["bumped into"],
    "eyecatcher": [],
    "positive": ["headway"],  // Note: Only one "headway" matched due to removal logic
    "negative": ["bumped"]
  }
}
```

---

## Notes

- The function matches terms case-insensitively
- Terms are matched as substrings, so longer phrases are checked first (e.g., "going easily" before "easily")
- When a term is matched, it's removed from the search string to prevent double-matching
- Some terms may appear in multiple categories (e.g., "eyecatcher" appears in both `eyecatcher` and `positive` arrays)
- The function handles empty strings, null, and "-" by returning empty arrays
