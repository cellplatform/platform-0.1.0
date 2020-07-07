import { primitives } from './fn.primitives';
import { toDeclaration } from './fn.toDeclaration';
import { walk } from './fn.walk';
import { prepare } from './fn.prepare';
import * as validate from './fn.validate';
import * as line from './fn.line';

/**
 * Typescript transformations and validation.
 */
export class TypeScript {
  /**
   * Generate a typescript declaration file.
   */
  static toDeclaration = toDeclaration;

  /**
   * Generator of immutable primitive VALUE types.
   */
  public static primitives = primitives;

  /**
   * Validation helpers.
   */
  public static validate = validate;

  /**
   * Helper for walking a type hierarchy.
   */
  public static walk = walk;

  /**
   * Final preparation of a code file (foramtting and clean up).
   */
  public static prepare = prepare;

  /**
   * Helpers for evaluating single lines of code.
   */
  public static line = line;
}
