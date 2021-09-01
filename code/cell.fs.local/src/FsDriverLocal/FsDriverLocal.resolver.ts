import { Path, Schema, t, PathUri } from '../common';

type O = t.IFsResolveOptionsLocal;

/**
 * Generates a resolver function.
 */
export function FsDriverLocalResolver(args: { dir: string }): t.FsPathResolver<O> {
  const { dir } = args;

  const fn: t.FsPathResolver<O> = (
    address: string,
    options?: t.IFsResolveOptionsLocal,
  ): t.IFsLocation => {
    const type = options?.type ?? 'DEFAULT';
    const uri = (address ?? '').trim();

    if (type === 'SIGNED/post') {
      // NB: A local simulated end-point of an AWS/S3 "presignedPost" URL.
      const args = options as t.S3SignedPostOptions;
      const key = resolve(dir, uri);
      const mime = args.contentType || Schema.Mime.toType(key, 'application/octet-stream');
      return {
        path: Schema.Urls.routes.LOCAL.FS,
        props: { 'content-type': mime, key },
      };
    }

    if (type !== 'DEFAULT') {
      const err = `Local file-system resolve only supports "DEFAULT" or "SIGNED/post" operation.`;
      throw new Error(err);
    }

    return {
      path: resolve(dir, uri),
      props: {}, // NB: only relevant for S3 (pre-signed POST).
    };
  };

  return fn;
}

/**
 * [Helpers]
 */

function resolve(dir: string, uri: string) {
  const ensureScope = (result: string) => {
    if (!result.startsWith(dir))
      throw new Error(`Resulting path is not within scope of root directory.`);
    return result;
  };

  if (Schema.Uri.is.file(uri)) return ensureScope(Path.resolve.fileUri({ dir, uri }));

  if (PathUri.is(uri)) {
    return ensureScope(Path.join(dir, PathUri.path(uri) ?? ''));
  }

  throw new Error(`Invalid URI. Must be "file:.." or "path:.."`);
}
