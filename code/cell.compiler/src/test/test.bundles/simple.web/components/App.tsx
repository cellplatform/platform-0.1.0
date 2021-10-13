import React from 'react';

export type AppProps = { name?: string };
export const App: React.FC<AppProps> = (props) => <div>App {props.name}</div>;
export default App;
