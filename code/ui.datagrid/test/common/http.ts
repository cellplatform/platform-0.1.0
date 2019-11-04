import { client } from '@platform/cell.http/lib/client';

export const http = client.init({ host: 'localhost', port: 8080 });
