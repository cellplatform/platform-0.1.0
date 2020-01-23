console.log('👋 Hello World from Typescript');

const f = import('./m');

f.then(e => {
  console.log('e', e);
});
