import { HttpClient } from '../Client.http';
import { t } from '../common';

/**
 * A strongly typed client-library for operating with a CellOS end-point.
 */
export class Client {
  public static Http = HttpClient;

  /**
   * Create a new HTTP client.
   */
  public static http(input?: t.ClientHttpInput) {
    return Client.Http.create(input);
  }
}
