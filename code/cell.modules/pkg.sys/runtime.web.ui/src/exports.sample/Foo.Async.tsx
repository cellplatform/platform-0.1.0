import React from 'react';
import { t } from '../common';
import { Foo } from './Foo';

/**
 * Default "asynchronous" entry function (sample).
 */
const entry: t.ModuleDefaultEntry = async (bus, ctx) => {
  console.group('💦🌳🌼 ModuleDefaultEntry: Foo (Async)');
  console.log('bus', bus);
  console.log('ctx', ctx);
  console.log('source', ctx.source);
  console.groupEnd();

  return <Foo title={'Foo Async 🐷'} />;
};

export default entry;
