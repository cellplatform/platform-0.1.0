import { ERROR, Schema, t, time, util, value } from '../common';
import { UploadEvent } from './HttpClientCellFs.upload.event';
import { uploadToTarget } from './HttpClientCellFs.upload.files';

type R = t.IHttpClientCellFileUploadResponse;

/**
 * Upload file(s) to an endpoint.
 */
export function uploadFiles(args: {
  input: t.IHttpClientCellFileUpload | t.IHttpClientCellFileUpload[];
  http: t.Http;
  urls: t.IUrls;
  cellUri: string;
  changes?: boolean;
}): t.IHttpClientCellFsUploadPromise {
  const { http, urls, cellUri } = args;
  const sendChanges = args.changes ?? false;

  const input = value.asArray(args.input).filter((file) => file.data.byteLength > 0); // NB: 0-byte files will cause upload error.
  const event = UploadEvent({ total: input.length, uri: cellUri });

  const promise = new Promise<t.IHttpClientResponse<R>>(async (resolve) => {
    await time.wait(0); // NB: Pause to allow any [event$] listeners to subscribe on the returned promise.

    const errors: R['errors'] = [];
    const addError = (status: number, message: string) => {
      const type = ERROR.HTTP.FILE;
      const error: t.IHttpErrorFile = { status, type, message };
      errors.push(error);
      return error;
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

      event.dispose();
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

    try {
      /**
       * [1]. Initial POST to the service.
       *      This sets up the models, and retrieves the pre-signed S3 urls to upload to.
       */
      const uploadStartBody: t.IReqPostCellFsUploadStartBody = {
        expires: undefined, // Expires.
        files: input.map((item) => {
          const filehash = Schema.Hash.sha256(item.data);
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
      const uploadStart = res1.json as t.IResPostCellFsUploadStart;
      addChanges(uploadStart.data.changes);

      /**
       * [2]. Upload files to S3 (or the local file-system).
       */
      const fileUploadWait = uploadToTarget({
        http,
        urls: uploadStart.urls.uploads,
        files: input,
        fire: event.fire,
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
      const cellUploadCompleteBody: t.IReqPostCellFsUploadCompleteBody = {};

      const res4 = await http.post(url.complete, cellUploadCompleteBody);
      const cellUploadComplete = res4.json as t.IResPostCellFsUploadComplete;

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
    } catch (error: any) {
      const status = 500;
      addError(status, error.message);
      return done(status);
    }
  });

  // Attach event stream to the returned promise.
  (promise as any).event$ = event.$;
  return promise as t.IHttpClientCellFsUploadPromise;
}
