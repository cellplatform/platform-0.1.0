import { defaultValue, t, util, ERROR, FormData, Schema } from '../common';

type R = t.IHttpClientCellFileUploadResponse;

/**
 * Upload file(s) to an endpoint.
 */
export async function uploadFiles(args: {
  input: t.IHttpClientCellFileUpload | t.IHttpClientCellFileUpload[];
  http: t.IHttp;
  urls: t.IUrls;
  cellUri: string;
  changes?: boolean;
}) {
  const { http, urls, cellUri } = args;
  const sendChanges = defaultValue(args.changes, false);

  let input = Array.isArray(args.input) ? args.input : [args.input];
  input = input.filter((file) => file.data.byteLength > 0); // NB: 0-byte files will cause upload error.

  const errors: R['errors'] = [];
  const addError = (status: number, message: string) => {
    const type = ERROR.HTTP.FILE;
    errors.push({ status, type, message });
  };

  const done = (status: number, options: { cell?: R['cell']; files?: R['files'] } = {}) => {
    const responseBody: R = {
      uri: cellUri,
      cell: options.cell || {},
      files: options.files || [],
      errors,
      changes,
    };

    let error: t.IHttpError | undefined;
    if (errors.length > 0) {
      error = { type: ERROR.HTTP.FILE, status, message: 'Failed to upload.' };
    }

    return util.toClientResponse<R>(status, responseBody, { error });
  };

  if (input.length === 0) {
    const message = `No files provided to client to upload [${cellUri}]`;
    addError(400, message);
    return done(400);
  }

  let changes: t.IDbModelChange[] | undefined;
  const addChanges = (input?: t.IDbModelChange[]) => {
    if (sendChanges && input && input.length > 0) {
      changes = changes || [];
      changes = [...changes, ...input];
    }
  };

  const fileUrls = urls.cell(cellUri).files;
  const url = {
    start: fileUrls.upload.query({ changes: sendChanges }).toString(),
    complete: fileUrls.uploaded.query({ changes: sendChanges }).toString(),
  };

  /**
   * [1]. Initial POST to the service.
   *      This sets up the models, and retrieves the pre-signed S3 urls to upload to.
   */
  const uploadStartBody: t.IReqPostCellFilesUploadStartBody = {
    expires: undefined, // Expires.
    files: input.map((item) => {
      const filehash = Schema.hash.sha256(item.data);
      const file: t.IReqPostCellUploadFile = {
        filehash,
        filename: item.filename,
        mimetype: item.mimetype,
        allowRedirect: item.allowRedirect,
        's3:permission': item['s3:permission'],
      };
      return file;
    }),
  };
  const res1 = await http.post(url.start, uploadStartBody);
  if (!res1.ok) {
    let message = `Failed during initial file-upload step to [${cellUri}]`;
    if (typeof res1.json === 'object' && typeof (res1.json as any).message === 'string') {
      message = `${message}. ${(res1.json as any).message}`;
    }
    addError(res1.status, message);
    return done(res1.status);
  }
  const uploadStart = res1.json as t.IResPostCellFilesUploadStart;
  addChanges(uploadStart.data.changes);

  /**
   * [2]. Upload files to S3 (or the local file-system).
   */
  const uploadUrls = uploadStart.urls.uploads;
  const fileUploadWait = uploadUrls
    .map((upload) => {
      const file = input.find((item) => item.filename === upload.filename);
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

  const res2 = await Promise.all(fileUploadWait);
  const fileUploadSuccesses = res2.filter((item) => item.ok);
  const fileUploadFails = res2.filter((item) => !item.ok);
  const fileUploadErrors = fileUploadFails.map((item) => {
    const { filename, status } = item;
    const message = `Client failed while uploading file '${filename}' (${status})`;
    const error: t.IFileUploadError = { type: 'FILE/upload', filename, message };
    return error;
  });

  /**
   * [3]. POST "complete" for each file-upload causing
   *      the underlying model(s) to be updated with file
   *      meta-data retrieved from the file-system.
   */
  const res3 = await Promise.all(
    fileUploadSuccesses.map(async (item) => {
      const url = urls.file(item.uri).uploaded.query({ changes: sendChanges }).toString();
      const { filename } = item;
      const body: t.IReqPostFileUploadCompleteBody = { filename };
      const res = await http.post(url, body);
      const { status, ok } = res;
      const json = res.json as t.IResPostFileUploadComplete;
      const file = json.data;
      return { status, ok, json, file, filename };
    }),
  );
  res3.forEach((res) => addChanges(res.json.changes));

  const fileCompleteFails = res3.filter((res) => !res.ok);
  const fileCompleteFailErrors = fileCompleteFails.map((res) => {
    const filename = res.filename || 'UNKNOWN';
    const message = `Failed while completing upload of file '${filename}' (${res.status})`;
    const error: t.IFileUploadError = { type: 'FILE/upload', filename, message };
    return error;
  });

  /**
   * [4]. POST "complete" for the upload to the owner cell.
   */
  const cellUploadCompleteBody: t.IReqPostCellFilesUploadCompleteBody = {};
  const res4 = await http.post(url.complete, cellUploadCompleteBody);
  const cellUploadComplete = res4.json as t.IResPostCellFilesUploadComplete;
  const files = cellUploadComplete.data.files;
  addChanges(cellUploadComplete.data.changes);

  // Build an aggregate list of upload errors.
  [...uploadStart.data.errors, ...fileUploadErrors, ...fileCompleteFailErrors].forEach((error) => {
    const status = 500;
    let message = error.message;
    message = error.filename ? `${error.message}. Filename: ${error.filename}` : message;
    addError(status, message);
  });

  // Finish up.
  const status = errors.length === 0 ? 200 : 500;
  return done(status, { cell: cellUploadComplete.data.cell, files });
}
