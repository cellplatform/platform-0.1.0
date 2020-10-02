import { t } from '../common';
import * as config from './ConfigBuilder';

export const WebpackBuilders: t.WebpackBuilders = {
  config: config.factory,
};
