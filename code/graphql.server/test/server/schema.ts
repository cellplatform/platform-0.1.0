import { mergeSchemas } from 'graphql-tools';

import * as schema1 from './schema-1';
import * as schema2 from './schema-2';

export function init(args: {}) {
  // NB: Pass in initialation args that you'd need for each of the executable schemas.
  const schemas = [schema1.init(), schema2.init()];
  const schema = mergeSchemas({ schemas });
  return schema;
}
