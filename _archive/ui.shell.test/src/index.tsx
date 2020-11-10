import * as React from 'react';

export * from './types';

export const MyComponent = (props: { text?: string }) => {
  const title = props.text || 'Hello!';
  return <h1>👋 {title}</h1>;
};
