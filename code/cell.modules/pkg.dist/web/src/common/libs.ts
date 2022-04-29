import { clamp, equals } from 'ramda';
export const R = { clamp, equals };

/**
 * @platform
 */
export { log } from '@platform/log/lib/client';
export { css, color, color as Color, CssValue, formatColor } from '@platform/css';
export { useResizeObserver, FC } from '@platform/react';
export { rx, slug, time } from '@platform/util.value';

/**
 * @system
 */
export { Json } from 'sys.data.json';
export { WebRuntime } from 'sys.runtime.web';

export { Vimeo } from 'sys.ui.video/lib/ui/Vimeo';
export { Photo } from 'sys.ui.primitives/lib/ui/Photo';
export { Fullscreen } from 'sys.ui.primitives/lib/ui/Fullscreen';
export { Antechamber } from 'sys.ui.primitives/lib/ui/Antechamber';
export { Text } from 'sys.ui.primitives/lib/ui/Text';
export { Event } from 'sys.ui.primitives/lib/ui/Event';
export { Button } from 'sys.ui.primitives/lib/ui.ref/button/Button';
export { Spinner } from 'sys.ui.primitives/lib/ui.ref/spinner/Spinner';
