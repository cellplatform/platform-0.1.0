/**
 * @platform
 */
export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor } from '@platform/css';
export { WebRuntime, bundle } from '@platform/cell.runtime.web';
export { useResizeObserver } from '@platform/react';

/**
 * Electron App (Renderer).
 */
export { IpcBus, Bundle, Log, Menu, System, Window, env } from '../../../app/src/renderer';
