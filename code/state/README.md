![Module](https://img.shields.io/badge/%40platform-state-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/state.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/state)
![banner](https://uih.sfo2.digitaloceanspaces.com/%40platform/repo-banners/state.png)

A small, simple [rx/observable](https://github.com/ReactiveX/rxjs) based state-machine.  
For applying to [UI](https://en.wikipedia.org/wiki/User_interface) see the [react](https://reactjs.org) bindings at [`@platform/state.react`](../state.react)



## Install

    yarn add @platform/state

<p>&nbsp;<p>


## Getting Started


Define your `model` and mutation `events`:

```typescript
type IMyModel = {
  count: number;
};

type MyEvent = IIncrementEvent | IDecrementEvent;
type IIncrementEvent = { type: 'TEST/increment'; payload: { by: number } };
type IDecrementEvent = { type: 'TEST/decrement'; payload: { by: number } };
type IStatustEvent = { type: 'TEST/status'; payload: { status: string } };
```

<p>&nbsp;<p>

Create a new state-machine:

```typescript
import { Store } from '@platform/state';

const initial: IMyModel = { count: 0, status: string };
const store = Store.create<IMyModel, MyEvent>({ initial });
```

<p>&nbsp;<p>

Define a listener that mutates the state based on a specific event type (equivalent to a ["reducer"](https://redux.js.org/basics/reducers)):

```typescript
store
  .on<ITestIncrementEvent>('TEST/increment')
  .subscribe(e => {
    const count = e.state.count + e.payload.by
    const next = { ...e.state, count };
    e.change(next); // UPDATE: New copy of state applied.
  });
```

<p>&nbsp;<p>

Dispatch events to change state:

```typescript
store.state // => count === 0
store.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
store.state // => count === 1
```

<p>&nbsp;<p>

Listen for changes to the state and react accordingly, for instance updating UI that may be rendering the state.:

```typescript
store.changed$.subscribe(e => { 
  // ... 
});
```

<p>&nbsp;<p>

Add logic that reacts to events asynchronously and dispatches new update events (equivalent to an ["epic"](https://redux-observable.js.org)):


```typescript
store
  .on<IIncrementEvent>('TEST/increment')
  .pipe(debounceTime(300))
  .subscribe(async e => { 
    const status = await getNetworkStatus();
    e.dispatch({type: 'TEST/status', payload:{ status }});
  });
```

