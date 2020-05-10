import * as net from 'net';
import { value } from './libs';

export const port = {
  /**
   * Generates an random unused port.
   */
  async unused(preferred?: number): Promise<number> {
    const number = preferred === undefined ? port.random() : preferred;

    // If the port is already in use, call this method again.
    if (await port.isUsed(number)) {
      return port.unused(); // <== RECURSION 🌳
    }

    return number;
  },

  /**
   * Generates a randon port number.
   * See:
   *    https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Dynamic,_private_or_ephemeral_ports
   */
  random() {
    const MIN = 49152;
    const MAX = 65535;
    return value.random(MIN, MAX);
  },

  /**
   * Determines if the given port is currently in use.
   */
  async isUsed(port: number) {
    return new Promise<boolean>(async (resolve, reject) => {
      const server = net.createServer(socket => {
        socket.write('echo\r\n');
        socket.pipe(socket);
      });
      server.listen(port);
      server.on('error', e => resolve(true));
      server.on('listening', () => {
        server.close();
        resolve(false);
      });
    });
  },
};
