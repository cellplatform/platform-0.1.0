import { t, util, ERROR, FormData, Schema } from '../common';

export async function upload(args: {
  input: t.IClientCellFileUpload | t.IClientCellFileUpload[];
  http: t.IHttp;
  urls: t.IUrls;
  cellUri: string;
}) {
  const { http, urls, cellUri } = args;
  const input = Array.isArray(args.input) ? args.input : [args.input];

  //
  // 1. Initial POST to the service.
  //    This sets up the models, and retrieves the pre-signed S3 urls to upload to.
  const url = urls.cell(cellUri).files.upload.toString();
  const postBody: t.IReqPostCellUploadFilesBody = {
    seconds: undefined, // Expires.
    files: input.map(({ filename, data }) => {
      const filehash = Schema.hash.sha256(data);
      return { filename, filehash };
    }),
  };
  const res1 = await http.post(url, postBody);
  if (!res1.ok) {
    const type = ERROR.HTTP.SERVER;
    const message = `Failed during initial file-upload step to '${cellUri}'.`;
    return util.toError(res1.status, type, message);
  }
  const uploadStart = res1.json as t.IResPostCellUploadFiles;

  //
  // 2. Upload files to S3.
  //
  const uploads = uploadStart.urls.uploads;
  const uploadWait = uploads
    .map(upload => {
      const file = input.find(item => item.filename === upload.filename);
      const data = file ? file.data : undefined;
      return { data, upload };
    })
    .filter(({ data }) => Boolean(data))
    .map(async ({ upload, data }) => {
      const { url } = upload;

      const uploadToS3 = async () => {
        // Prepare upload multi-part form.
        const props = upload.props;
        const contentType = props['content-type'];
        const form = new FormData();
        Object.keys(props)
          .map(key => ({ key, value: props[key] }))
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
        const path = upload.props.key;
        const headers = { 'content-type': 'multipart/form-data', path };
        return http.post(url, data, { headers });
      };

      // Upload data.
      const isLocal = url.startsWith('http://localhost');
      const res = await (isLocal ? uploadToLocal() : uploadToS3());

      // Finish up.
      const { ok, status } = res;
      const { uri, filename, expiresAt } = upload;
      return { ok, status, uri, filename, expiresAt };
    });

  const res2 = await Promise.all(uploadWait);
  const uploadErrors = res2.filter(item => !item.ok);
  const uploadSuccess = res2.filter(item => item.ok);

  /**
   * TODO 🐷
   * - return list of upload errors.
   * - clean up upload errors.
   */

  //
  // 3. Perform verification on each file-upload causing
  //    the underlying model(s) to be updated with file
  //    meta-data and the new file-hash.
  //
  const uploadCompletedWait = uploadSuccess.map(async item => {
    const url = urls.file(item.uri).uploaded.toString();
    const body: t.IReqPostFileUploadCompleteBody = {};
    const res = await http.post(url, body);
    return res.json as t.IResPostFileUploadComplete;
  });
  const res3 = await Promise.all(uploadCompletedWait);

  // Weave in the AFTER file objects.
  const files = uploadStart.data.files.map(({ uri, before }) => {
    const file = res3.find(item => item.uri === uri);
    const after = file ? file.data : undefined;
    return { uri, before, after };
  });

  // Finish up.
  const body: t.IResPostCellUploadFiles = {
    ...uploadStart,
    data: { ...uploadStart.data, files },
  };
  return util.toClientResponse<t.IResPostCellUploadFiles>(200, body);
}
