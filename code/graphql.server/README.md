![Module](https://img.shields.io/badge/%40platform-graphql-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/graphql.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/graphql)
![banner](https://user-images.githubusercontent.com/185555/57007050-d8569780-6c39-11e9-81ea-32b96ceb0cef.png)

[Express](https://expressjs.com) configuration of [Apollo](https://www.apollographql.com/docs/apollo-server) [Graphql](https://graphql.org) server.

<p>&nbsp;<p>

## JSON Data
When returning unstructured JSON data include the `scalar JSON` within the type-defs:

```typescript
export const typeDefs = gql`
  scalar JSON

  type Query {
    myObject: JSON
  }
`;


export const resolvers = {
  Query: {
    myObject: async (_: any, args: any, ctx: any, info: any) => {
      return { count: 123, message: 'Any structure' };
    },
  },
};

```




<p>&nbsp;<p>
<p>&nbsp;<p>

