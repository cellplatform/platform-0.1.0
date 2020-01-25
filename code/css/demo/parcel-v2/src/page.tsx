import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { css } from '@platform/css';

console.log('css', css);
console.log('css.global', css.global);
console.log('css.merge', css.merge);
console.log('css.head', css.head);

// css.global({
//   body: {
//     fontFamily: 'sans-serif',
//     backgroundColor: '#ececec',
//     padding: 25,
//   },
// });

const MyApp = () => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      padding: 30,
    }),
    h1: css({
      color: 'red',
      fontSize: 74,
      marginBottom: 45,
      letterSpacing: '-2.5px',
    }),
  };

  return (
    <div {...styles.base}>
      <h1 {...styles.h1}>Hello, CSS.</h1>
    </div>
  );
};

ReactDOM.render(<MyApp />, document.getElementById('root'));
