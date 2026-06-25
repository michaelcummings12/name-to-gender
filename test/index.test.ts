import { describe, it, expect } from "vitest";
import { guessGender, isMale, isFemale } from "../src/index";
import { normalizeName } from "../src/normalize";

describe("guessGender", () => {
  it("classifies unambiguous male and female names", () => {
    expect(guessGender("John").gender).toBe("male");
    expect(guessGender("Mary").gender).toBe("female");
  });

  // These are the exact names other popular packages get wrong (they tag them
  // female). The fix is the whole reason this package exists, so they are locked
  // down here.
  it.each(["Adam", "Chris", "Ryan", "Aaron", "Justin", "Kyle", "Tyler", "Nathan", "Isaac", "Jesse"])(
    "classifies %s as male",
    (name) => {
      expect(guessGender(name).gender).toBe("male");
    }
  );

  it("returns a probability and the raw counts", () => {
    const result = guessGender("Adam");
    expect(result.gender).toBe("male");
    expect(result.probability).toBeGreaterThan(0.99);
    expect(result.counts.male).toBeGreaterThan(result.counts.female);
    expect(result.name).toBe("adam");
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(guessGender("  JENNIFER ").gender).toBe("female");
    expect(guessGender("jennifer").gender).toBe("female");
  });

  it("uses only the first token of a full name", () => {
    const result = guessGender("Tim Johnson");
    expect(result.gender).toBe("male");
    expect(result.name).toBe("tim");
  });

  it("folds accents and strips punctuation/emoji", () => {
    expect(guessGender("José").gender).toBe("male");
    expect(guessGender("::Jenni♥fer::").name).toBe("jennifer");
  });

  it("falls back to the pre-hyphen segment for compound names", () => {
    // "anne-marie" may not be stored whole; "anne" is.
    expect(guessGender("Anne-Marie").gender).toBe("female");
  });

  it("returns unknown for names not in the dataset", () => {
    const result = guessGender("Xyzzy");
    expect(result.gender).toBe("unknown");
    expect(result.probability).toBe(0);
    expect(result.name).toBe("xyzzy");
  });

  it("returns unknown with a null name for empty/garbage input", () => {
    for (const input of [null, undefined, "", "   ", "♥♥♥"]) {
      const result = guessGender(input as string);
      expect(result.gender).toBe("unknown");
      expect(result.name).toBe(null);
    }
  });

  it("downgrades low-confidence guesses to unknown when minProbability is set", () => {
    // Casey is genuinely unisex (~59% male); a high bar should reject it.
    const lenient = guessGender("Casey");
    expect(lenient.gender).not.toBe("unknown");
    const strict = guessGender("Casey", { minProbability: 0.9 });
    expect(strict.gender).toBe("unknown");
    // Counts/probability are still exposed so callers can see why.
    expect(strict.counts.male).toBeGreaterThan(0);
    expect(strict.probability).toBeGreaterThan(0.5);
  });
});

describe("isMale / isFemale", () => {
  it("are mutually exclusive for gendered names", () => {
    expect(isMale("Adam")).toBe(true);
    expect(isFemale("Adam")).toBe(false);
    expect(isFemale("Mary")).toBe(true);
    expect(isMale("Mary")).toBe(false);
  });

  it("both return false for unknown names", () => {
    expect(isMale("Xyzzy")).toBe(false);
    expect(isFemale("Xyzzy")).toBe(false);
  });
});

describe("normalizeName", () => {
  it("extracts a clean first-name token", () => {
    expect(normalizeName("Tim Johnson")).toBe("tim");
    expect(normalizeName("  José ")).toBe("jose");
    expect(normalizeName("D'Angelo")).toBe("d'angelo");
    expect(normalizeName("MARY")).toBe("mary");
  });

  it("returns null when nothing usable remains", () => {
    expect(normalizeName(null)).toBe(null);
    expect(normalizeName("")).toBe(null);
    expect(normalizeName("123 ♥")).toBe(null);
  });
});
