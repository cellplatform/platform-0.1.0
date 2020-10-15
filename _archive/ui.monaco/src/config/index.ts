/**
 * HACK: Register monaco on the global namespace.
 *       If it's not present it fails when imports below.
 */
import { monaco } from '../common';
(self as any)._monaco = monaco;

import './import.workers';
import './import.features';
import './import.languages';

export * from './configure';
// export * from './configure.language';
