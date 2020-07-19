import { t, Uri } from '../../common';

/**
 * Load the data at the given URI.
 */
export async function load<T extends keyof t.AppTypeIndex>(args: {
  client: t.IClientTypesystem;
  uri: t.IRowUri;
  typename: T;
}) {
  const { client, typename } = args;
  const uri = args.uri.toString();
  const sheet = await client.sheet<t.AppTypeIndex>(uri);
  if (!sheet.types.some((type) => type.typename === typename)) {
    throw new Error(`Sheet at URI (${uri}) is not of type [${typename}].`);
  }
  const data = await sheet.data(typename).load({ range: args.uri.key });
  const row = data.row(Uri.toRowIndex(uri));
  return { sheet, data, row };
}
