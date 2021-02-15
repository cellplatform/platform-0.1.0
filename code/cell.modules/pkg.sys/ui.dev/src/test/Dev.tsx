import React from 'react';

import { Harness } from '..';
import { rx } from '../common';
import { ACTIONS } from './Dev.ACTIONS';

const bus = rx.bus();

export const Dev: React.FC = () => {
  return <Harness bus={bus} actions={ACTIONS} />;
};
