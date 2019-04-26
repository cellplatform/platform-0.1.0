![Module](https://img.shields.io/badge/%40platform-state-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/state.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/state)
![banner](https://user-images.githubusercontent.com/185555/55848775-3267be00-5ba2-11e9-8a34-9ecc96dd137a.png)

A small, simple, [strongly typed](https://typescriptlang.org), [rx/observable](https://github.com/ReactiveX/rxjs) state-machine.  
For applying to [UI](https://en.wikipedia.org/wiki/User_interface) see the [react](https://reactjs.org) bindings at [`@platform/state.react`](../state.react)



## Setup

    yarn add @platform/state

Define your `model` and mutation `events`:

```typescript
export type IMyModel = {
  count: number;
};

type MyEvent = IIncrementEvent | IDecrementEvent;
type IIncrementEvent = {
  type: 'TEST/increment';
  payload: { by: number };
};
type IDecrementEvent = {
  type: 'TEST/decrement';
  payload: { by: number };
};
```

Create a new state-machine:

```typescript
import { Store } from '@platform/state';

const initial: IMyModel = { count: 0 };
const store = Store.create<IMyModel, MyEvent>({ initial });
```