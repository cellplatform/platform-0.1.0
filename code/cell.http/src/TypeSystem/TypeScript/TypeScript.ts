import { primitives } from './fn.primitives';
import { toDeclaration } from './fn.toDeclaration';
import { walk } from './fn.walk';
import * as validate from './fn.validate';

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
}
