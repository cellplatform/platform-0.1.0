import {
  TypeClient,
  TypeCache,
  TypedSheet,
  TypeTarget,
  TypeValue,
  TypeDefault,
} from './TypeSystem.core';
import { TypedSheetChangeMonitor } from './TypeSystem.sync';

import { objectToCells, fetcher } from './TypeSystem.util';

export class TypeSystem {
  public static Client = TypeClient;
  public static Cache = TypeCache;
  public static Target = TypeTarget;
  public static Value = TypeValue;
  public static Default = TypeDefault;
  public static Sheet = TypedSheet;
  public static SheetChangeMonitor = TypedSheetChangeMonitor;

  public static client = TypeClient.client;
  public static fetcher = fetcher;
  public static objectToCells = objectToCells;
}
