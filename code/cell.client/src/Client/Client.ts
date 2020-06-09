import { Subject } from 'rxjs';

import { HttpClient } from '../Client.http';
import { saveMonitor, typesystem } from '../Client.typesystem';
import { t, TypeSystem } from '../common';

/**
 * A strongly typed client-library for operating with a CellOS end-point.
 */
export class Client {
  public static Http = HttpClient;
  public static TypeSystem = TypeSystem;

  /**
   * Create a new HTTP client.
   */
  public static http(input?: t.ClientHttpInput) {
    return Client.Http.create(input);
  }

  /**
   * Manage saving changes to a given HTTP gateway.
   */
  public static saveMonitor = saveMonitor;

  /**
   * Access point for working with the TypeSystem.
   */
  public static typesystem = typesystem;

  /**
   * Construct from env.
   */
  public static env(env: t.IEnv) {
    return typesystem({
      http: env.host,
      event$: env.event$ as Subject<t.TypedSheetEvent>,
      cache: env.cache,
    });
  }
}
