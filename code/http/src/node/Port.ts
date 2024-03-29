import * as net from 'net';
import { value } from '../common';

export const Port = {
  /**
   * Generates an random unused port.
   */
  async unused(preferred?: number): Promise<number> {
    const number = preferred === undefined ? Port.random() : preferred;

    // If the port is already in use call this method again.
    if (await Port.isUsed(number)) {
      return Port.unused(); // <== RECURSION 🌳
    }

    return number;
  },

  /**
   * Determines if the given port is currently in use.
   */
  async isUsed(port: number, host?: string) {
    return new Promise<boolean>(async (resolve) => {
      const server = net.createServer((socket) => {
        socket.write('echo\r\n');
        socket.pipe(socket);
      });
      server.listen(port, host);
      server.on('error', (err) => resolve(true));
      server.on('listening', () => {
        server.close();
        resolve(false);
      });
    });
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
};
