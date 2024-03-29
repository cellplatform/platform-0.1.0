import { equals, clone } from 'ramda';
export const R = { equals, clone };

/**
 * @platform
 */
export { css, CssValue, CssProps, color, Color } from '@platform/css';
export { http } from '@platform/http';
export { log } from '@platform/log/lib/client';
export { Uri, Schema } from '@platform/cell.schema';
export { StateObject } from '@platform/state';
export { HttpClient } from '@platform/cell.client';
export { time, rx, slug, deleteUndefined } from '@platform/util.value';
export { FC } from '@platform/react';
export { Http } from '@platform/http';

/**
 * @system
 */
export { WebRuntime, ModuleUrl } from 'sys.runtime.web.ui';
export { Filesystem } from 'sys.fs/lib/web/ui';

export { Markdown } from 'sys.data.markdown';

export { ObjectView } from 'sys.ui.primitives/lib/ui/ObjectView';
export { PropList } from 'sys.ui.primitives/lib/ui/PropList';
export { Chip } from 'sys.ui.primitives/lib/ui/Chip';
