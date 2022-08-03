import { t } from './common';
import { create } from './builder.chain';
import { format } from './builder.format';
import { isBuilder } from './builder.is';

export const Builder: t.Builder = { create, format, isBuilder };
