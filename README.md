# name-to-gender

Guess the gender of a first name from US Social Security birth data. Returns a
**probability** and the **raw birth counts** behind every guess, not just a
label. TypeScript-first, ESM + CJS, **zero runtime dependencies**.

```ts
import { guessGender } from "name-to-gender";

guessGender("Adam");
// {
//   gender: "male",
//   probability: 0.996,
//   counts: { male: 523494, female: 2002 },
//   name: "adam"
// }
```

## Why another one?

The existing name-gender packages are either inaccurate or unmaintained. Many of
them tag common male names like Adam and Chris as female, and none of the actively-maintained ones return a confidence score you can threshold on.

| package                      | data          | last updated | confidence | types   |
| ---------------------------- | ------------- | ------------ | ---------- | ------- |
| `gender`                     | US Census     | 2013         | yes        | no      |
| `gender-guess`               | SSA 1930–2013 | 2014         | yes        | no      |
| `gender-detection`           | mixed         | 2018         | **no**     | no      |
| `gender-detection-from-name` | mixed         | 2025         | **no**     | no      |
| **`name-to-gender`**         | **US SSA**    | **fresh**    | **yes**    | **yes** |

## Install

```sh
npm install name-to-gender
```

## Usage

### `guessGender(name, options?)`

```ts
import { guessGender } from "name-to-gender";

guessGender("Mary");
// { gender: "female", probability: 0.995, counts: { male: 7732, female: 1467208 }, name: "mary" }

// Messy input is handled: full names, casing, accents, and punctuation.
guessGender("  José Martinez ").gender; // "male"  (uses the first token, folds accents)
guessGender("::Jenni♥fer::").name; // "jennifer"

// Names not in the dataset return "unknown" with a zero probability.
guessGender("Xyzzy");
// { gender: "unknown", probability: 0, counts: { male: 0, female: 0 }, name: "xyzzy" }
```

#### Thresholding unisex names

Some names are unisex. Pass `minProbability` to treat low-confidence
guesses as `"unknown"` while still seeing the underlying numbers:

```ts
guessGender("Casey"); // gender: "male" (≈59% male)
guessGender("Casey", { minProbability: 0.9 }); // gender: "unknown", probability: 0.59, counts: {...}
```

### `isMale(name, options?)` / `isFemale(name, options?)`

Convenience booleans. Both return `false` for unknown or below-threshold names.

```ts
import { isMale, isFemale } from "name-to-gender";

isMale("Ryan"); // true
isFemale("Ryan"); // false
```

### Result shape

```ts
interface GenderGuess {
  gender: "male" | "female" | "unknown";
  probability: number; // P(gender), in [0.5, 1]; 0 when unknown
  counts: { male: number; female: number };
  name: string | null; // the normalized name that was looked up
}
```

## How it works

`name-to-gender` is **data-driven, not rule-based**. It normalizes the input to
a first-name token, looks it up in a table of all-time US births by name and
sex, and reports the majority sex along with its share. There are no `"ends in
-a → female"` heuristics, which is exactly what makes the older packages fail on
names like Adam and Joshua.

The dataset is built from the public-domain
[US Social Security Administration baby-names data](https://www.ssa.gov/oact/babynames/).
It works best for US/English-context names. See
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to regenerate it from the latest
SSA release.

## License

MIT © Michael Cummings
