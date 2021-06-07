const init = import('./dom.init');

init.catch((err) => {
  console.log('INIT 🐷', err);
});
