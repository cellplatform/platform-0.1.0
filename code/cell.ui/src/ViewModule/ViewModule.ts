import { Module } from '@platform/cell.module';

import { t } from '../common';
import { create } from './ViewModule.create';
import { events } from './ViewModule.events';
import { fire } from './ViewModule.fire';

export const ViewModule: t.ViewModule = {
  ...Module,
  create,
  events,
  fire,
};
