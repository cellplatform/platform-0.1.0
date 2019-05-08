import { IDb } from '@platform/hyperdb.types';

export * from '@platform/auth/lib/types';
export * from '@platform/hyperdb.types';
export * from '@platform/conversation.types';
export * from './graphql/types';

export type IConversationDbModel = { [key: string]: any };
export type IConversationDb = IDb<IConversationDbModel>;
export type GetConverstaionDb = () => Promise<IConversationDb>;
