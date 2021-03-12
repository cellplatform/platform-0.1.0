import { equals, clone, clamp, uniq } from 'ramda';
export const R = { equals, clone, clamp, uniq };

import { css, color, CssValue, style } from '@platform/css';
export { css, color, CssValue, style };
export const formatColor = color.format;

export { rx, time, defaultValue, dispose, is, asArray, slug, value } from '@platform/util.value';

import { StateObject } from '@platform/state';
export { StateObject };
export const toObject = StateObject.toObject;

export { Markdown } from '@platform/util.markdown';

export { HttpClient, Uri } from '@platform/cell.client';
import { Builder } from '@platform/cell.module';
export { Builder };
export const format = Builder.format;

export { WebRuntime } from '@platform/cell.runtime.web';

export { log } from '@platform/log/lib/client';
export { useClickOutside } from '@platform/react/lib/hooks';
