import '@platform/polyfill';

console.log('entry', 'hello.');
(async () => {
  class Foo {
    public static count = 123;
  }
  new Foo();
})();
