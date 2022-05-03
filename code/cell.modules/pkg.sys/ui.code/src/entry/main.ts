const init = import('./main.dom');

init.catch((err) => {
  console.log('INIT 🐷', err);
});
