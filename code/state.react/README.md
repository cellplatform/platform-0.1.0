![Module](https://img.shields.io/badge/%40platform-state.react-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/state.react.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/state.react)
![banner](https://platform.sfo2.digitaloceanspaces.com/repo-banners/state.react.png)

[React](https://reactjs.org) bindings for [@platform/state](../state).


## Install

    yarn add @platform/state.react

To see example running in UI see [@platform/state.react.tools](../state.react.tools)


<p>&nbsp;<p>



## Getting Started

Define a model and create a store:

```typescript
import { Store } from '@platform/state';

type IMyModel = {
  count: number;
};

type MyEvent = IIncrementEvent | IDecrementEvent;
type IIncrementEvent = { type: 'TEST/increment'; payload: { by: number } };
type IDecrementEvent = { type: 'TEST/decrement'; payload: { by: number } };


const initial: IMyModel = { count: 0 };
const store = Store.create<IMyModel, MyEvent>({ initial });

```


<p>&nbsp;<p>


Configure consuming components to recieve the state-container [context](https://reactjs.org/docs/context.html):

```typescript
import { state } from '@platform/state.react'

export class MyView extends React.PureComponent {
  public static contextType = state.Context;
  public context!: state.ReactContext
  public store = this.context.getStore<IMyModel, MyEvent>();
}
```


<p>&nbsp;<p>


Render the root of the tree with a [context](https://reactjs.org/docs/context.html) `<Provider>`:

```typescript
export const Provider = state.createProvider(store);

export class MyRoot extends React.PureComponent {
  public render() {
    return (
      <Provider>
        <div>...</div>
      </Provider>
    );
  }
}
```
