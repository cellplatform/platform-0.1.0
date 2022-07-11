import { DEFAULTS, FC, t, THEMES } from './common';
import { FieldBuilder } from './FieldBuilder';
import { PropList as View } from './PropList.View';
import { PropListProps } from './types';
import { FieldSelector } from './ui/FieldSelector';

export { PropListProps };

type Fields = {
  THEMES: typeof THEMES;
  DEFAULTS: typeof DEFAULTS;
  FieldSelector: typeof FieldSelector;
  FieldBuilder: typeof FieldBuilder;
  builder<F extends string>(): t.PropListFieldBuilder<F>;
};
export const PropList = FC.decorate<PropListProps, Fields>(
  View,
  {
    THEMES,
    DEFAULTS,
    FieldSelector,
    FieldBuilder,
    builder: FieldBuilder,
  },
  { displayName: 'PropList' },
);
