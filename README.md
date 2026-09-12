# tsds-c8

Internal c8 coverage command used by `ts-dev-stack`. It runs a TypeScript
library's Mocha tests and writes coverage output.

## Install

```bash
npm install --save-dev ts-dev-stack tsds-config
```

## Use

```bash
npx tsds coverage
```

With no test path, the command uses `test/**/*.test.*`. Pass a path after
`coverage` to select different tests, or add `--dry-run` to check command
selection without running them. See the
[ts-dev-stack documentation](https://www.npmjs.com/package/ts-dev-stack) for
project setup.
