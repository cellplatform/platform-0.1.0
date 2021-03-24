import { HttpClient, t } from '../../common';

/**
 * Sample file upload.
 */
export async function upload(files: t.IHttpClientCellFileUpload[]) {
  const origin = HttpClient.create('https://os.ngrok.io');
  const client = origin.cell('cell:ckmld6jm000005bqtedve0ic1:A1');

  return await Promise.all(
    files.map(async (item) => {
      const { data, mimetype } = item;
      const filename = `tmp/${item.filename}`;
      await client.fs.upload({ filename, data, mimetype });
      return client.url.file.byName(filename).toString();
    }),
  );
}
