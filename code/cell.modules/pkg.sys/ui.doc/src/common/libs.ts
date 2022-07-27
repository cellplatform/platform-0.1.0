import { mergeDeepRight, clone } from 'ramda';
export const R = { mergeDeepRight, clone };

/**
 * @platform
 */
export { css, Color, CssValue, Style, formatColor } from '@platform/css';
export { useResizeObserver, FC } from '@platform/react';
export { rx, slug, time } from '@platform/util.value';
export { Http } from '@platform/http';
export { value as Value } from '@platform/util.value';
export { Is } from '@platform/util.is';

/**
 * @system
 */
export { Filesystem } from 'sys.fs/lib/web/ui';
export { WebRuntime } from 'sys.runtime.web';
export { PropList } from 'sys.ui.primitives/lib/ui/PropList';
export { MinSize } from 'sys.ui.primitives/lib/ui/MinSize';
export { Photo } from 'sys.ui.primitives/lib/ui/Photo';
export { Button } from 'sys.ui.primitives/lib/ui.ref/button/Button';
export { Chip } from 'sys.ui.primitives/lib/ui/Chip';
export { List } from 'sys.ui.primitives/lib/ui/List';
export { Card } from 'sys.ui.primitives/lib/ui/Card';
export { Text } from 'sys.ui.primitives/lib/ui/Text';
export { LoadMask } from 'sys.ui.primitives/lib/ui/LoadMask';
