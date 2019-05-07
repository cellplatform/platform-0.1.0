import { IDb } from '@platform/hyperdb/lib/types';

export * from '@platform/hyperdb/lib/types';
export * from '@platform/conversation.types';
export * from './graphql/types';

export type IConversationDbModel = {
  FOO: any;
};
export type IConversationDb = IDb<IConversationDbModel>;
export type GetConverstaionDb = () => Promise<IConversationDb>;
