const ctx: Worker = self as any;
export default ctx;

console.log('(🌼) worker.web.ts (sys.runtime/WebWorker)');

// Post data to parent thread.
ctx.postMessage({ msg: 'Hello from sys.runtime.ui(🌼) [worker.web.ts]' });

// Respond to message from parent thread.
ctx.addEventListener('message', (e) => {
  // console.log('sys.runtime.ui(🌼): 🌳 Event (from host)', e.data);
});
