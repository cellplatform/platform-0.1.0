const ctx: Worker = self as any;

// Post data to parent thread.
ctx.postMessage({ msg: '|| Hello from [web.worker.ts]' });

// Respond to message from parent thread.
ctx.addEventListener('message', (e) => console.log('🌳 event (from parent thread)', e.data));

export default ctx;
