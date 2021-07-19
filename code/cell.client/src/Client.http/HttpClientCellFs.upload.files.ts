import { FormData, t } from '../common';
import { FireUploadEvent } from './HttpClientCellFs.upload.event';

/**
 * Uploads files to the given URLs
 */
export function uploadToTarget(args: {
  http: t.Http;
  urls: t.IFilePresignedUploadUrl[];
  files: t.IHttpClientCellFileUpload[];
  fire: FireUploadEvent;
}) {
  const { http, fire, urls, files } = args;

  return urls
    .map((upload) => {
      const file = files.find((item) => item.filename === upload.filename);
      const data = file ? file.data : undefined;
      return { data, upload };
    })

    .filter(({ data }) => Boolean(data))

    .map(async ({ upload, data }) => {
      const { url } = upload;
      const path = upload.props.key;

      const uploadToS3 = async () => {
        // Prepare upload multi-part form.
        const props = upload.props;
        const contentType = props['content-type'];

        const form = new FormData();
        Object.keys(props)
          .map((key) => ({ key, value: props[key] }))
          .forEach(({ key, value }) => form.append(key, value));
        form.append('file', data, { contentType }); // NB: file-data must be added last for S3.

        // Send form to S3.
        const headers = form.getHeaders();
        return http.post(url, form, { headers });
      };

      const uploadToLocal = async () => {
        // HACK:  There is a problem sending the multi-part form to the local
        //        service, however just posting the data as a buffer (rather than the form)
        //        seems to work fine.
        const headers = { 'content-type': 'multipart/form-data', path };
        return http.post(url, data, { headers });
      };

      // Upload data.
      const res = await (upload.filesystem === 'S3' ? uploadToS3() : uploadToLocal());

      // Prepare result.
      const { ok, status } = res;
      const { uri, filename, expiresAt } = upload;
      let error: t.IFileUploadError | undefined;
      if (!ok) {
        const message = `Client failed while uploading file '${filename}' (${status})`;
        error = { type: 'FILE/upload', filename, message };
      }

      // Alert listeners that the file is uploaded.
      fire({
        file: { filename, uri },
        error: error ? { status, type: 'HTTP/file', message: error.message } : undefined,
      });

      // Finish up.
      return { ok, status, uri, filename, expiresAt, error };
    });
}
