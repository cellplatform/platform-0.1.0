/**
 * Service-worker.
 */
async function startServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('./service.worker.js');
    console.log('🎉 Service worker registered:', registration);
  } catch (error) {
    console.log('Service worker registration failed:', error);
  }
}

if ('serviceWorker' in navigator) {
  startServiceWorker();
} else {
  console.log('Service workers are not supported.');
}
