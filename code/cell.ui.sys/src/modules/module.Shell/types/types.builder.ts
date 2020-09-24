import * as t from '../common/types';

/**
 * Builder for a single node within the <Shell>
 */
export type ShellBuilderNode = {
  id: string;
};

export type ShellBuilderBase<R> = ShellBuilderRenderer<R> & {};

/**
 * Render
 */

export type ShellBuilderRenderer<R> = {
  render(fn: ShellRender): R;
};

export type ShellRenderContext = {};
export type ShellRenderResponse = JSX.Element | null;
export type ShellRender = (ctx: ShellRenderContext) => ShellRenderResponse | void;
