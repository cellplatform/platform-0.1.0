import { expect } from '../test';
import { port } from '.';
import * as net from 'net';

const testServer = (port: number) => {
  return new Promise<net.Server>((resolve) => {
    const server = net.createServer((socket) => {
      socket.write('echo\r\n');
      socket.pipe(socket);
    });
    server.listen(port);
    server.on('listening', () => resolve(server));
  });
};

describe('node: port', () => {
  it('isUsed', async () => {
    const PORT = 6050;
    expect(await port.isUsed(PORT)).to.eql(false);

    const server = await testServer(PORT);
    expect(await port.isUsed(PORT)).to.eql(true);

    server.close();
    expect(await port.isUsed(PORT)).to.eql(false);
  });

  it('unused', async () => {
    const PORT = 6050;
    expect(await port.unused(PORT)).to.eql(PORT);

    const server = await testServer(PORT);
    expect(await port.unused(PORT)).to.not.eql(PORT);

    server.close();
    expect(await port.unused(PORT)).to.eql(PORT);
  });
});
