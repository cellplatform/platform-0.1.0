import React from 'react';

import { Harness } from '..';
import { HttpClient, rx } from '../common';
import { ACTIONS } from './Dev.ACTIONS';

const bus = rx.bus();
export const Dev: React.FC = () => <Harness bus={bus} actions={ACTIONS} />;
