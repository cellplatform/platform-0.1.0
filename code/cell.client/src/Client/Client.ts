import { TypeSystem } from '../common';
import { HttpClient } from '../Client.http';
import { typesystem } from './Client.typesystem';
import * as t from './types';

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
   * Access point for working with the TypeSystem.
   */
  public static typesystem = typesystem;
}
