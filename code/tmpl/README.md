![Module](https://img.shields.io/badge/%40platform-tmpl-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/tmpl.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/tmpl)

![Header](https://user-images.githubusercontent.com/185555/51378810-daa55200-1b72-11e9-9658-275929147ee9.png)

Succinct, composable, template stamping pipeline.  
Think of it as your scaffolding superpower.

For the out-of-box CLI experience see [create-tmpl](https://www.npmjs.com/package/create-tmpl):

```
yarn create tmpl
```

<p>&nbsp;</p>

## Setup

```
yarn install @platform/tmpl
```

<p>&nbsp;</p>

## Introduction

Compose directories and files together with [glob](<https://en.wikipedia.org/wiki/Glob_(programming)>) patterns into a powerful `Template` that can be copied anywhere...to the file-system, to memory, wherever.

Add simple `middleware` functions to the pipeline to precisely customize each file as it is written, taking variable arguments (via the [API](#API)) or values entered by the user (via the [command-line](#CLI)).

#### Interfaces

- Simple, flexible programmatic control via the [API](#API)
- or rich command-line interaction via the [CLI](#CLI).

## Philosophy

The [best programmers are lazy](http://threevirtues.com). If you do anything [more than three times](http://wiki.c2.com/?ThreeStrikesAndYouAutomate), it might be a [good idea to automate it](http://wiki.c2.com/?AutomationIsOurFriend) 🤖

The `create-tmpl` module is here to make creating repeatable scaffolding through templates painless, powerful and low-effort. So low effort, in fact, you're more than likely to do it.

#### Design principles

- Lean on the file-system.
- Simple [configuration](Configuration) (or "no-configuration").
- Beautiful [command-line](#CLI) that's fast and fun to use.
- Powerful composability of source files (assemble base template and then make overriding variants).
- Elegant [API](#API) for integrating into other modules.
- Pluggable [middleware](#Middleware) pipeline for extensibility.

#### Maxims

- [Rule of Three](http://wiki.c2.com/?RuleOfThree) | [Three Strikes And You Automate](http://wiki.c2.com/?ThreeStrikesAndYouAutomate)
- [Automation Is Our Friend](http://wiki.c2.com/?AutomationIsOurFriend)
- [Useful, Usable, Used](http://wiki.c2.com/?UsefulUsableUsed)

<p>&nbsp;</p>

---

<p>&nbsp;</p>

## 🌳 CLI

### Installation

To use the `tmpl` command-line across your machine install it globally:

```bash
yarn global add create-tmpl
```

then use `tmpl` from any folder:

```bash
$ tmpl <command> [options]
$ tmpl --help
```

---

### Local Module

To use the `tmpl` command locally within your scripts, add it to your module:

```bash
yarn add create-tmpl
```

then invoke it from `scripts` within your `package.json` like so:

```json
{
  "name": "my-module",
  "scripts": {
    "postinstall": "tmpl ./node_modules/my-module/setup-template"
  },
  "dependencies": {
    "create-tmpl": "latest"
  }
}
```

---

### Configuration

...`TDB`

---

### Commands

...`TDB`

<p>&nbsp;</p>

![Virtues](https://user-images.githubusercontent.com/185555/51451491-6a791500-1d9a-11e9-9695-27f185325104.png)

<p>&nbsp;</p>

## 🌳 API

When working with a `Template` you'll move through three stages:

1. Template [composition](#Composition 'add source files')
2. [Filters](#Filtering) and [middleware processors](#Middleware).
3. Execution

Templates are immutable, meaning any calls to the `.add`, `.filter`, `.use` methods return a new instance of the `Template` (conceptually similar to [rxjs](https://github.com/ReactiveX/rxjs)).

<p>&nbsp;</p>

### Composition (add source files)

A template is composed of one or more file locations consisting of a directory and an optional [glob](<https://en.wikipedia.org/wiki/Glob_(programming)>) pattern (default is `**`, everything).

```typescript
import { Template } from 'create-tmpl';

const tmpl = Template.create()
  .add({ dir: './templates/one' })
  .add({ dir: './templates/two', pattern: '**/*.md' });
```

Template files that are added later which collide will override the earlier paths. Use this capability to create base template folders and then compose together more specialised templates that incrementally expand and alter the base set of files.

To see the resulting files that make up the template:

```typescript
const files = await tmpl.files();
```

<p>&nbsp;</p>

### Filtering

Create a subset of the template using filters:

```typescript
const markdown = tmpl.filter(file => file.path.endsWith('.md'));
const files = await markdown.files(); // Now only markdown files.
```

<p>&nbsp;</p>

### Middleware

A pipeline of middleware functions provide the mechanism for transforming templates and saving them to the file-system, or wherever you need to send the execution result. Template middleware is conceptually equivalent to [express middleware](https://expressjs.com/en/guide/using-middleware.html):

```typescript
import { template, path, fs } from 'create-tmpl';
type IMyVariables = { greeting: string };

const tmpl = template
  .create()
  .add({ dir: './tmpl-1' })
  .add({ dir: './tmpl-2' })

  // Transform the text content of files (naive example 🤭 ).
  .use<IMyVariables>((req, res) => {
    res.replaceText(/__GREETING__/g, req.variables.greeting).next(); // Signal to move to next middleware.
  })

  // Save the file to disk.
  .use(async (req, res) => {
    const dir = path.resolve('./output');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, req.path), req.buffer);

    // Signal the operation is complete (no more middleware will run).
    res.complete();
  });
```

Middleware is executed in the order that it is added to the pipeline. Call `res.next()` to move to the next middleware in the pipeline, or call `res.complete()` when done, and the execution pipeline finished.

```typescript
const tmpl = Template.create('./my-tmpl').use(/\.ts$/, (req, res) => {
  // Operate on typescript file only.
  // ...
  res.next();
});
```

When adding middleware you can optionally apply `pathFilter` [regular-expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) to narrow which file paths the middleware applies to. The example above operates on `.ts` files only. Passing an array of regular-expressions acts as an `OR` set.

<p>&nbsp;</p>

### Execution

We now have a configured template that will transform text files and save them to disk when executed.  
Let's execute it passing in some variables:

```typescript
const variables: IMyVariables = { greeting: 'Hello!' };
await tmpl.execute<IMyVariables>({ variables });
```

<p>&nbsp;</p>
<p>&nbsp;</p>
