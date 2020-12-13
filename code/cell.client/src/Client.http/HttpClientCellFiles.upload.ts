import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { defaultValue, ERROR, FormData, Schema, t, util, time, value } from '../common';

type R = t.IHttpClientCellFileUploadResponse;

/**
 * Upload file(s) to an endpoint.
 */
export function uploadFiles(args: {
  input: t.IHttpClientCellFileUpload | t.IHttpClientCellFileUpload[];
  http: t.IHttp;
  urls: t.IUrls;
  cellUri: string;
  changes?: boolean;
}): t.IHttpClientCellFilesUploadPromise {
  const event$ = new Subject<t.IHttpClientUploadedEvent>();

  const promise = new Promise<t.IHttpClientResponse<R>>(async (resolve, reject) => {
    const { http, urls, cellUri } = args;
    const sendChanges = defaultValue(args.changes, false);

    await time.wait(0); // NB: Pause to allow any [event$] listeners to subscribe.

    let input = Array.isArray(args.input) ? args.input : [args.input];
    input = input.filter((file) => file.data.byteLength > 0); // NB: 0-byte files will cause upload error.

    const errors: R['errors'] = [];
    const addError = (status: number, message: string) => {
      const type = ERROR.HTTP.FILE;
      const error: t.IHttpErrorFile = { status, type, message };
      errors.push(error);
      return error;
    };

    const event = {
      tx: Schema.cuid(),
      completed: 0,
      fire(
        args: {
          file?: t.IHttpClientUploaded['file'];
          error?: t.IHttpErrorFile;
          done?: boolean;
        } = {},
      ) {
        const { file, error } = args;

        if (file && !error) {
          event.completed++;
        }

        const total = input.length;
        const completed = event.completed;
        const done = completed >= total ? true : args.done || false;

        event$.next({
          type: 'HttpClient/uploaded',
          payload: value.deleteUndefined({
            uri: cellUri,
            tx: event.tx,
            file,
            total,
            completed,
            done,
          }),
        });
      },
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
        error = { type: ERROR.HTTP.FILE, status, message: 'Failed to upload' };
      }

      event$.complete();
      const result = util.toClientResponse<R>(status, responseBody, { error });
      resolve(result);
    };

    if (input.length === 0) {
      const message = `No files provided to client to upload [${cellUri}]`;
      event.fire({ error: addError(400, message), done: true });
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

    event.fire(); // Initial event (before upload starts).

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
      event.fire({ error: addError(res1.status, message), done: true });
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
        const isLocal = Schema.Url.isLocal(url);
        const res = await (isLocal ? uploadToLocal() : uploadToS3());

        // Prepare result.
        const { ok, status } = res;
        const { uri, filename, expiresAt } = upload;
        let error: t.IFileUploadError | undefined;
        if (!ok) {
          const message = `Client failed while uploading file '${filename}' (${status})`;
          error = { type: 'FILE/upload', filename, message };
        }

        // Finish up.
        event.fire({
          file: { filename, uri },
          error: error ? { status, type: 'HTTP/file', message: error.message } : undefined,
        });
        return { ok, status, uri, filename, expiresAt, error };
      });

    const res2 = await Promise.all(fileUploadWait);
    const fileUploadSuccesses = res2.filter((item) => item.ok);
    const fileUploadErrors = res2
      .filter((item) => Boolean(item.error))
      .map((item) => item.error as t.IFileUploadError);

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
    [...uploadStart.data.errors, ...fileUploadErrors, ...fileCompleteFailErrors].forEach(
      (error) => {
        const status = 500;
        let message = error.message;
        message = error.filename ? `${error.message}. Filename: ${error.filename}` : message;
        event.fire({ error: addError(status, message), done: true });
      },
    );

    // Finish up.
    const status = errors.length === 0 ? 200 : 500;
    return done(status, { cell: cellUploadComplete.data.cell, files });
  });

  // Attach event stream to the returned promise.
  (promise as any).event$ = event$.pipe(share());
  return promise as t.IHttpClientCellFilesUploadPromise;
}
