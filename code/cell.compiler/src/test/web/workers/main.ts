const ctx: Worker = self as any;

// Post data to parent thread.
ctx.postMessage({ msg: 'From main (worker)' });

// Respond to message from parent thread.
ctx.addEventListener('message', (e) => {
  console.log('event (from parent thread)', e.data);
});
