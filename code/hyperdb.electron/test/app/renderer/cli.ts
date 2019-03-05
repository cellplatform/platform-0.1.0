import { Command } from './common';

export const root = Command.create('hyperdb')
  .add('status')
  .add('watch')
  .add('put');
