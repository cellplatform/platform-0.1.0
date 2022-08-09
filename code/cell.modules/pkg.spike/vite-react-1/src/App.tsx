import { useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  const load = () => {
    setCount((prev) => prev + 1);

    // http://192.168.1.2:3000/my-lib.js
    const url = 'http://localhost:3000/lib.foo.js';

    const script = document.createElement('script');
    script.src = url;
    script.type = 'module';
    script.async = true;

    console.log('fetch', fetch);

    script.onload = (e) => {
      console.log('onload', e);
    };
    script.onerror = (e) => {
      console.log('onerror', e);
    };

    // next({ ready: false, failed: false });
    document.head.appendChild(script);
  };

  return (
    <div style={{ fontSize: 50, fontFamily: 'sans-serif' }}>
      <div onClick={load}>foo</div>
      <div>{count}</div>
    </div>
  );
}

export default App;
