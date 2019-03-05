import { Command } from './common';

export const root = Command.create('hyperdb')
  .add('get')
  .add('put')
  .add('watch');
