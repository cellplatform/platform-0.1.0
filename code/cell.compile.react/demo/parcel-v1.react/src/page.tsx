import * as React from 'react';
import * as ReactDOM from 'react-dom';

console.log('👋 Hello React from TypeScript');

const MyApp = () => {
  return (
    <div>
      <h1>Hello (react).</h1>
    </div>
  );
};

ReactDOM.render(<MyApp />, document.getElementById('root'));
