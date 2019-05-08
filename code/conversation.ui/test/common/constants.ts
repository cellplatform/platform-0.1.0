// tslint:disable no-object-literal-type-assertion

export * from '../../src/common/constants';
import * as t from './types';

export const GRAPHQL = {
  URI: 'http://localhost:5000/graphql',
};

export const PEOPLE = {
  MARY: {
    id: 'sub|platform.mary@gmail.com',
    email: 'platform.mary@gmail.com',
    // name: 'mary',
  } as t.IUserIdentity,
  JEN: { id: '1234-abc', name: 'Jen Coates', email: 'platform.jen@gmail.com' } as t.IUserIdentity,
  DOUG: { id: 'platform.doug@gmail.com' } as t.IUserIdentity,
  MAX: { id: 'platform.max@gmail.com', name: 'Maximilian Smith' } as t.IUserIdentity,
};

export const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris.';
