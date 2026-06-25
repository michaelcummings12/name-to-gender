# Contributing

Thank you for considering contributing to `name-to-gender`!

## Development

1. Clone the repo.
2. Install dependencies: `npm install`.
3. Make your changes in `src/`.
4. Run tests: `npm test`.
5. Build: `npm run build`.

## Updating the dataset

The name frequency data lives in `src/data/us.json` and is generated from the
public-domain US Social Security Administration baby-names dataset.

To refresh it with the latest year of data:

1. Download `names.zip` from <https://www.ssa.gov/oact/babynames/names.zip>.
2. Unzip the `yobXXXX.txt` files into `scripts/source/`.
3. Run `npm run build:data`.

See `scripts/build-data.ts` for the aggregation logic.

## Testing

We use `vitest`. Ensure all tests pass before submitting a PR. If you add new
features, please add corresponding tests in `test/index.test.ts`.

## Release

Bump the version in `package.json` and merge to `main`. CI publishes to npm
automatically when the version changes.
