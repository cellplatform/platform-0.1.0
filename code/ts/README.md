# @platform/ts
Common [TypesScript](https://www.typescriptlang.org) and [linter](https://palantir.github.io/tslint/) configuration with command-line tools.



## Commands
Adds the `ts` command to your module's bin. You can optionally use the following scripts in you `package.json`:

```json
{
  "scripts: {
    "test": "ts test",
    "tdd": "ts test --watch",
    "lint": "ts lint",
    "build": "ts build",
    "prepare": "ts prepare",
  }
}
```
