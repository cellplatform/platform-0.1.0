export function init() {
  console.log('👋  loaded: Bar.tsx');

  const el = document.getElementById('STATUS');
  if (el) {
    el.innerHTML = 'Dynamic module loaded.';
  }
}
