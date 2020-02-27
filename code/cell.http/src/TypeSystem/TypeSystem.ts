import { TypeClient } from './TypeClient';
import { TypedSheet } from './TypedSheet';
import { TypeTarget } from './TypeTarget';
import { objectToCells, fetcher } from './util';

export class TypeSystem {
  public static Type = TypeClient;
  public static Sheet = TypedSheet;
  public static Target = TypeTarget;
  public static fetcher = fetcher;
  public static objectToCells = objectToCells;
}
