const init = import('./main.init');

init.catch((err) => {
  console.log('INIT 🐷', err);
});
