import { t } from '../common';
import * as config from './WebpackConfigBuilder';

export const WebpackBuilders: t.WebpackBuilders = {
  config: config.factory,
};
