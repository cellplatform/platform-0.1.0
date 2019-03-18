![Module](https://img.shields.io/badge/%40platform-util.animate-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/util.animate.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/util.animate)

# util.animate
Physics based animation.  Uses [dynamics.js](http://dynamicsjs.com/) under the hood.

## Usage
Within a [React](https://reactjs.org/) component:


```typescript
private animate(target: { value1: number; value2: number }) {
  this.stop$.next();  // Stop currently executing animation (if any).
  const current = () => this.state;
  const duration = 200;
  animation
    .start({ target, current, duration, type: 'easeInOut' })
    .pipe(takeUntil(this.stop$))
    .subscribe({
      next: data => this.setState(data as any),
      complete: () => {
         // Done.
      },
    });
}
```

