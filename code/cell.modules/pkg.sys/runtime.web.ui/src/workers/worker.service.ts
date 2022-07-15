const ctx: ServiceWorker = self as any;

// import { BundleCache } from '@platform/cell.runtime.web/lib/BundleCache';
// BundleCache.serviceWorker(self, { log: 'verbose', localhost: false });

import { HttpCache } from '../Web.HttpCache';
HttpCache.serviceWorker(self, { log: 'verbose', runOnLocalhost: true });
