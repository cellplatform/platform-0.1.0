import '@platform/polyfill';

console.log('entry', ': hello');
console.log('');

(async () => {
  class Foo {
    public static count = 123;
  }
  new Foo();

  if (typeof window === 'object') {
    document.body.innerHTML = `<h1>Hello World!</h1>`;
  }
})();
