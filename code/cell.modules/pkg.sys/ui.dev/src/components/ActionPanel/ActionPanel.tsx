import React from 'react';

import { t } from '../../common';
import { ActionBuilder } from '../../api';
import { View, ViewProps } from './View';

/**
 * Attach additional properties to the component.
 */
type A = React.FC<ViewProps> & { build: t.DevActionModelFactory['builder'] };
(View as A).build = ActionBuilder.builder;

export const ActionPanel = View as A;
export default ActionPanel;
