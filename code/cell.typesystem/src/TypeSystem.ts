import {
  TypeClient,
  TypeCache,
  TypedSheet,
  TypeTarget,
  TypeValue,
  TypeDefault,
  objectToCells,
  fetcher,
} from './TypeSystem.core';
// import { TypeCache } from './TypeCache';
// import { TypedSheet } from './TypedSheet';
// import { TypeTarget } from './TypeTarget';
// import { TypeValue } from './TypeValue';
// import { TypeDefault } from './TypeDefault';

// import { objectToCells, fetcher } from './util';

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
