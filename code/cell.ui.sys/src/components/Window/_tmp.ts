import { t } from '../../common';

export async function write(args: { ctx: t.ISysContext; files?: t.IHttpClientCellFileUpload[] }) {
  const { ctx, files = [] } = args;

  console.group('🌳 ');

  console.log('write');
  console.log('files', files);
  console.groupEnd();
}
