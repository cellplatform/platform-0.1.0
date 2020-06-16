import { TypeBuilder } from './TypeSystem.builder';
import { TypeCache } from './TypeSystem.cache';
import { TypeClient, TypeDefault, TypeTarget, TypeValue } from './TypeSystem.core';
import { fetcher } from './TypeSystem.fetch';
import { ChangeMonitor, TypedSheet, SheetPool } from './TypeSystem.sheet';
import { objectToCells } from './util';

export class TypeSystem {
  public static Client = TypeClient;
  public static Cache = TypeCache;
  public static Target = TypeTarget;
  public static Value = TypeValue;
  public static Default = TypeDefault;

  public static Sheet = TypedSheet;
  public static Pool = SheetPool;
  public static ChangeMonitor = ChangeMonitor;

  public static client = TypeClient.client;
  public static fetcher = fetcher;
  public static objectToCells = objectToCells;
  public static def = TypeBuilder.create;
}
