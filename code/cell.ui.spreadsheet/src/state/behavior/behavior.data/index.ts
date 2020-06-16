import { t } from '../../../common';
import * as epic from './data.epic';
import * as reduce from './data.reduce';

export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { ctx, store } = args;
  reduce.init({ store });
  epic.init({ ctx, store });
}
