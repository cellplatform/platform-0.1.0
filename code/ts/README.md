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


## References:

- **ECMAScript Modules** (ESM)
  - [Using JavaScript modules on the web](https://developers.google.com/web/fundamentals/primers/modules) - Google/Primer
  - [ECMAScript modules in Node.js: the new plan](http://2ality.com/2018/12/nodejs-esm-phases.html) - December 2018
  - [ES6 Modules Today With TypeScript](https://www.ceriously.com/blog/post.php?id=2017-10-16-es6-modules-today-with-typescript.md) - recipe used.

