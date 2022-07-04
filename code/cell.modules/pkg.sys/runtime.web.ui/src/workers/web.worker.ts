const ctx: Worker = self as any;
export default ctx;

// Post data to parent thread.
ctx.postMessage({ msg: 'Hello from sys.runtime(🌼) [web.worker.ts]' });

// Respond to message from parent thread.
ctx.addEventListener('message', (e) =>
  console.log('sys.runtime(🌼): 🌳 Event (from host)', e.data),
);
