import { TypeCache, TypeClient, TypeDefault, TypeTarget, TypeValue } from './TypeSystem.core';
import { ChangeMonitor, TypedSheet } from './TypeSystem.sheet';
import { fetcher, objectToCells } from './TypeSystem.util';
import { TypeBuilder } from './TypeSystem.builder';

export class TypeSystem {
  public static Client = TypeClient;
  public static Cache = TypeCache;
  public static Target = TypeTarget;
  public static Value = TypeValue;
  public static Default = TypeDefault;

  public static Sheet = TypedSheet;
  public static ChangeMonitor = ChangeMonitor;

  public static client = TypeClient.client;
  public static fetcher = fetcher;
  public static objectToCells = objectToCells;
  public static def = TypeBuilder.create;
}
