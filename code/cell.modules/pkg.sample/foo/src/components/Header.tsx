import * as React from 'react';
console.log('foo/Header.tsx!!!');

export const foo = () => {
  console.log('hello foo');
};

console.log('FOO...', React);

export const Header = () => {
  return <div>Header (Foo)</div>;
};

export default Header;
