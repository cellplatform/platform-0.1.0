import { fs, HttpClient, log, t } from '../../test';

const HOST = 'http://localhost:8080';
const CELL = 'cell:ckh19y2lf000003et6d5farp0:A1';

describe('Client (Integration)', function () {
  this.timeout(99999);

  it('upload', async () => {
    const client = HttpClient.create(HOST);
    const cell = client.cell(CELL);

    const data = await fs.readFile(fs.resolve('./package.json'));
    const file: t.IHttpClientCellFileUpload = { filename: 'foo/package.json', data };

    const res = await cell.files.upload(file);

    log.info('-------------------------------------------');
    log.info('upload status:', res.status);
    log.info('-------------------------------------------');

    const info = await cell.info();
    log.info(info.body);

    log.info('-------------------------------------------');
    log.info(info.body.urls);
  });
});
