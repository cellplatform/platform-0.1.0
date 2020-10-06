/**
 * Common value formatting performed by a builder.
 */
export type BuilderFormat = {
  string(input: any, options?: { default?: string; trim?: boolean }): string | undefined;
  boolean(input: any, options?: { default?: boolean }): boolean | undefined;
  number(
    input: any,
    options?: { min?: number; max?: number; default?: number },
  ): number | undefined;
};
