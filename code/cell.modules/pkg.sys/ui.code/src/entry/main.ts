const init = import('./main.dom');

init.catch((err) => {
  console.log('INIT sys.ui.code // 🐷 ERROR:', err);
});
