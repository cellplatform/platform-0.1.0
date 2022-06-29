import { ModuleInfo as View, ModuleInfoProps } from './ModuleInfo.View';
import { ModuleInfoStateful as Stateful } from './ModuleInfo.Stateful';
import { FC, DEFAULT, FIELDS } from './common';

export { ModuleInfoProps };

type Fields = {
  Stateful: typeof Stateful;
  DEFAULT: typeof DEFAULT;
  FIELDS: typeof FIELDS;
};
export const ModuleInfo = FC.decorate<ModuleInfoProps, Fields>(
  View,
  { Stateful, DEFAULT, FIELDS },
  { displayName: 'ModuleInfo' },
);
