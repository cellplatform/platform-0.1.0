import * as React from 'react';
import * as ReactDOM from 'react-dom';

export const Dev = () => {
  return <div>Dev: ui.editor.code</div>;
};

const root = document.body.appendChild(document.createElement('div'));
ReactDOM.render(<Dev />, root);
