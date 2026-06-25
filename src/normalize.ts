/**
 * Reduce arbitrary input to a single lowercase first-name token suitable for a
 * dataset lookup, or `null` when nothing usable remains.
 *
 * Handles the messy inputs real contact lists contain:
 *   "  José "            -> "jose"   (accents folded)
 *   "Tim Johnson"        -> "tim"    (first token only)
 *   "::Jenni♥fer::"      -> "jennifer" (punctuation/emoji stripped)
 *   "MARY"               -> "mary"   (case folded)
 */
export function normalizeName(input: string | null | undefined): string | null {
  if (!input) return null;

  // Fold accents/diacritics to their base ASCII letters (é -> e, ñ -> n) by
  // decomposing to NFD and dropping the combining marks (U+0300–U+036F).
  const folded = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Take the first whitespace-delimited token (the given name in "First Last").
  const firstToken = folded.trim().split(/\s+/)[0] ?? "";

  // Keep letters plus internal hyphen/apostrophe (Anne-Marie, D'Angelo); drop
  // everything else, then trim stray separators from the ends.
  const cleaned = firstToken
    .toLowerCase()
    .replace(/[^a-z'-]/g, "")
    .replace(/^[-']+|[-']+$/g, "");

  return cleaned || null;
}
