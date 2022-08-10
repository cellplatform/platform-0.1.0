import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  const loadScript = () => {
    setCount((prev) => prev + 1);

    // http://192.168.1.2:3000/my-lib.js
    const url = 'https://tmp.db.team/lib.foo.js';

    const script = document.createElement('script');
    script.src = url;
    script.type = 'module';
    script.async = true;

    script.onload = (e) => console.log('script/onload', e);
    script.onerror = (e) => console.log('script/onerror', e);

    document.head.appendChild(script);
  };

  return (
    <div style={{ fontSize: 50, fontFamily: 'sans-serif' }}>
      <div onClick={loadScript}>load library</div>
      <div>{count}</div>
    </div>
  );
}

export default App;
