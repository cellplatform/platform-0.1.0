import { gql, t } from '../common';

/**
 * [Types]
 */
export const typeDefs = gql`
  type Query {
    foo: JSON
  }
`;

/**
 * [Initialize]
 */
export function init(args: { getDb: t.GetConverstaionDb }) {
  const { getDb } = args;

  /**
   * [Resolvers]
   */
  const resolvers: t.IResolvers = {
    Query: {
      foo: async (_: any, args: any, ctx: t.IContext, info: any) => {
        const db = await getDb();

        // TEMP 🐷
        const values = await db.values({ pattern: 'MSG/th/1234/i' });
        Object.keys(values).forEach(key => {
          values[key] = values[key].value;
        });

        return values;
      },
    },
  };

  return { resolvers, typeDefs };
}
