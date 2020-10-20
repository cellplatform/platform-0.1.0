import * as React from 'react';
console.log('foo/Header.tsx!!!');

export const foo = () => {
  console.log('hello foo');
};

console.log('FOO...', React);

export const Header: React.FC = () => {
  return <div>Header (Foo)</div>;
};

export default Header;
