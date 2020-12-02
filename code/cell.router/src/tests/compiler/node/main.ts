console.log('main.ts');

import('./app');

// (res )({ foo: 123 });
// console.log('global', global);

console.log('self', self);

// if (typeof res === 'object') {

//   console.log('res', res as any);
// }

const foo = self as any;

foo.res({ foo: 123 });
