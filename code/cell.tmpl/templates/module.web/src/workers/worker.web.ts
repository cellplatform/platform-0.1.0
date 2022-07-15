const ctx: Worker = self as any;
export default ctx;

// Post data to parent thread.
ctx.postMessage({ msg: 'Hello from [worker.web.ts]' });

// Respond to message from parent thread.
ctx.addEventListener('message', (e) => console.log('🌳 Event (from host)', e.data));
