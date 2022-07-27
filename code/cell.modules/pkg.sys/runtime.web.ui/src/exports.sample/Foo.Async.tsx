import React from 'react';
import { t } from '../common';
import { Foo } from './Foo';

/**
 * Default "asynchronous" entry function (sample).
 */
const entry: t.ModuleDefaultEntry = async (pump, ctx) => {
  return <Foo title={'Foo Async 🐷'} />;
};

export default entry;
