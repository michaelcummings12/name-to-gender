import { normalizeName } from "./normalize";
import datasetJson from "./data/us.json";

/** name (lowercase) -> [maleCount, femaleCount] */
const dataset = datasetJson as unknown as Record<string, [number, number] | undefined>;

export type Gender = "male" | "female" | "unknown";

export interface GenderGuess {
  /** Predicted gender, or `"unknown"` when the name isn't in the dataset (or is below `minProbability`). */
  gender: Gender;
  /** Probability of the predicted gender, in `[0.5, 1]`. `0` when the result is `"unknown"`. */
  probability: number;
  /** Raw all-time US birth counts backing the guess. */
  counts: { male: number; female: number };
  /** The normalized name that was looked up, or `null` when none could be extracted. */
  name: string | null;
}

export interface GuessOptions {
  /**
   * Minimum probability required to return a gendered result. Guesses at or
   * below this threshold are reported as `"unknown"` (the `counts` and
   * `probability` are still returned so callers can inspect why). Default `0`.
   */
  minProbability?: number;
}

const UNKNOWN: GenderGuess = { gender: "unknown", probability: 0, counts: { male: 0, female: 0 }, name: null };

/**
 * Look up a name's counts, falling back to the segment before a hyphen for
 * compound names not stored whole (e.g. "anne-marie" -> "anne").
 */
function lookup(name: string): [number, number] | undefined {
  const direct = dataset[name];
  if (direct) return direct;
  const hyphen = name.indexOf("-");
  if (hyphen > 0) return dataset[name.slice(0, hyphen)];
  return undefined;
}

/**
 * Guess the gender of a first name from US Social Security birth data.
 *
 * @example
 * guessGender("Adam");
 * // { gender: "male", probability: 0.996, counts: { male: 523494, female: 2002 }, name: "adam" }
 */
export function guessGender(input: string | null | undefined, options: GuessOptions = {}): GenderGuess {
  const name = normalizeName(input);
  if (!name) return UNKNOWN;

  const counts = lookup(name);
  if (!counts) return { ...UNKNOWN, name };

  const [male, female] = counts;
  const total = male + female;
  if (total === 0 || male === female) {
    // No data, or a genuine 50/50 split with no signal either way.
    return { gender: "unknown", probability: total === 0 ? 0 : 0.5, counts: { male, female }, name };
  }

  const gender: Gender = male > female ? "male" : "female";
  const probability = Math.max(male, female) / total;
  const meetsThreshold = probability > (options.minProbability ?? 0);

  return { gender: meetsThreshold ? gender : "unknown", probability, counts: { male, female }, name };
}

/** Convenience helper: `true` only when the name is confidently male. */
export function isMale(input: string | null | undefined, options?: GuessOptions): boolean {
  return guessGender(input, options).gender === "male";
}

/** Convenience helper: `true` only when the name is confidently female. */
export function isFemale(input: string | null | undefined, options?: GuessOptions): boolean {
  return guessGender(input, options).gender === "female";
}
