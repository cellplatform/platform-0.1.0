![Module](https://img.shields.io/badge/%40platform-cell.module.sys-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/cell.module.sys.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/cell.module.sys)
![banner](https://user-images.githubusercontent.com/185555/91228277-12777100-e77c-11ea-81e2-cc947f0aec2f.png)

Module system - isolated event-driven state and logic.

![diagram](https://user-images.githubusercontent.com/185555/90992466-07013a00-e604-11ea-893a-7381db96ab76.png)

A cell module is an encapsulated unit of functionality containing:

- Type definitions for the `events` and `data` structures that constitute the module.
- The logic for booting the module into a runtime environment.
- The location of the compiled code assets ("bundle") of the module.
- The `client` for persisting module instance state down to the underlying cell memory.

<p>&nbsp;<p>

A module is itself nothing more than a "type of" `ITreeNode` data strcutrue that slots into a wider organizing tree. Modules may be used for managing UI ("user interface") or for purely computation operations.

<p>&nbsp;<p>

## Setup

    yarn add @platform/cell.module

<p>&nbsp;<p>
<p>&nbsp;<p>
