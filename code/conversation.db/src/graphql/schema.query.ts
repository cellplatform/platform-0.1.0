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
        // const foo = (await db.get('FOO')).value;

        const values = await db.values({});
        Object.keys(values).forEach(key => {
          values[key] = values[key].value;
        });

        return values;
      },
    },
  };

  return { resolvers, typeDefs };
}
