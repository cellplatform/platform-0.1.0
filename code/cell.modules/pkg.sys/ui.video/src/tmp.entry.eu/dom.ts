const start = import('./dom.init');

start.catch((err) => {
  console.log('INIT 🐷', err);
});
