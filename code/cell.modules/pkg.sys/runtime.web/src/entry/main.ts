/**
 * DOM (User Interface)
 */
export async function startDom() {
  const init = import('./main.dom');
  init.catch((err) => console.log('INIT ERROR 🐷', err));
}

/**
 * Startup
 */
startDom();
