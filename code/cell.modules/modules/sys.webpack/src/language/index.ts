import { t } from '../common';
import * as config from './wp.ConfigBuilder';

export const WebpackBuilders: t.WebpackBuilders = {
  config: config.factory,
};
