import {
  TypeClient,
  TypeCache,
  TypedSheet,
  TypeTarget,
  TypeValue,
  TypeDefault,
} from './TypeSystem.core';
import { objectToCells, fetcher } from './TypeSystem.util';

export class TypeSystem {
  public static Client = TypeClient;
  public static Cache = TypeCache;
  public static Sheet = TypedSheet;
  public static Target = TypeTarget;
  public static Value = TypeValue;
  public static Default = TypeDefault;

  public static client = TypeClient.client;
  public static fetcher = fetcher;
  public static objectToCells = objectToCells;
}
