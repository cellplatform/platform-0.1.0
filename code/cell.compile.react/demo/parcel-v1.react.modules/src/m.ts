export function init() {
  console.log('👋  loaded: m.ts');

  const el = document.getElementById('STATUS');
  if (el) {
    el.innerHTML = 'Dynamic module loaded.';
  }
}
