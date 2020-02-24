import { t } from '../common';
import { json } from './body.json';
import { buffer } from './body.buffer';
import { form } from './body.form';

export const body: t.BodyParser = {
  json,
  buffer,
  form,
};
