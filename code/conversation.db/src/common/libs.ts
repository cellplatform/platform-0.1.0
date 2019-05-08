export { log } from '@platform/log/lib/server';
export { gql } from '@platform/graphql.server';
export { Key } from '@platform/conversation.types';
export { value } from '@platform/util.value';

/**
 * Ramda
 */
import { sortBy, prop } from 'ramda';
export const R = { sortBy, prop };
