import React from 'react';
import { Harness } from 'sys.ui.dev';

import Component from './Component/Component.DEV';
export const ACTIONS = [Component];

export const Dev: React.FC = () => <Harness actions={ACTIONS} />;
