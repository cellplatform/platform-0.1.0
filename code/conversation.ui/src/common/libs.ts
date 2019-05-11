export { css, color, GlamorValue } from '@platform/react';
export { value, time, id as identity } from '@platform/util.value';
export { markdown } from '@platform/util.markdown';
export { state } from '@platform/state.react';
export { log } from '@platform/log/lib/client';
export { gql, graphql } from '@platform/graphql';
export { MsgKeys } from '@platform/conversation.types';
export * from '@platform/conversation.types';

/**
 * [Ramda]
 */
import { equals, sortBy, prop, uniqBy } from 'ramda';
export const R = { equals, sortBy, prop, uniqBy };
