import { t } from '../common';
import { json } from './body.json';
import { buffer } from './body.buffer';
import { form } from './body.form';

export const bodyParser: t.BodyParser = {
  json,
  buffer,
  form,
};
