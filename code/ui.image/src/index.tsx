import * as React from 'react';

export * from './types';
export const MyComponent = (props: { text?: string }) => <h1>👋 {props.text || 'Hello!'}</h1>;
