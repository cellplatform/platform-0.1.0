import { t } from '../common';

/**
 * A single file within a manifest.
 */
export type ManifestFile = {
  path: string;
  bytes: number;
  filehash: string;
  uri?: string;
  image?: t.ManifestFileImage;

  /**
   * Default: true (redirects to underlying storage on different URL)
   *
   * True:
   *    If the file is on a remote system (eg S3) an HTTP/307 redirection
   *    is issued pointing to the URL on the remote system.
   *    This is efficient from a server/bandwidth standpoint and
   *    additionally avoids unnecesary usage costs when operating
   *    in the cloud.  However, it can cause CORS security issues
   *    with certain resources, in particular .js (code) files.
   *
   * False:
   *    The file is pulled and streamed through the server itself.
   *    This can be necessary for avoiding CORS issues for specific
   *    resources such as .js (code) files being loaded into a
   *    [web-worker] thread.
   *
   */
  allowRedirect?: boolean;

  /**
   * Default: false.
   *    When false (not public) and redirecting to an S3 endpoint
   *    the target URL will be a "signed link" required to access
   *    the access-controlled S3 resource.
   */
  public?: boolean;
};

/**
 * Meta information about [image] file types.
 */
export type ManifestFileImage = {
  kind: 'png' | 'jpg' | 'svg';
  width: number;
  height: number;
};
