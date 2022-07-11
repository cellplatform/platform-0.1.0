export type AspectRatio = {
  x: number;
  y: number;
  error?: string;
  toString(): string;
  width(height: number): number;
  height(width: number): number;
};

/**
 * Tools for working with image aspect ratios.
 *
 *    r = x/y  (width:height)
 *
 * REF:
 *    https://en.wikipedia.org/wiki/Aspect_ratio_(image)
 */
export const AspectRatio = {
  /**
   * Calculate aspect ratio into standard "x:y" string format.
   */
  toString(x: number, y: number) {
    const c = AspectRatio.gcd(x, y);
    return `${x / c}:${y / c}`;
  },

  /**
   * Convert [x:y] values into an aspect-ratio helper.
   */
  toObject(x: number, y: number, options: { error?: string } = {}): AspectRatio {
    return {
      x,
      y,
      toString: () => `${x}:${y}`,
      error: options.error,
      width(height) {
        if (y === 0) throw new Error(`Cannot divide by 0 (y)`);
        return (height * x) / y;
      },
      height(width) {
        if (x === 0) throw new Error(`Cannot divide by 0 (x)`);
        return (width * y) / x;
      },
    };
  },

  /**
   * Parse an "x:y" aspect ratio into a usable object.
   */
  parse(input: string): AspectRatio {
    const error = (message: string) => {
      const error = `Failed to parse aspect ratio. ${message}`;
      return AspectRatio.toObject(-1, -1, { error });
    };

    if (typeof input !== 'string') return error(`Input is not a string.`);

    const parts = input
      .trim()
      .split(':')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length < 2) return error(`"${input}" does not contain a colon, eg. "2:1"`);
    if (parts.length > 2) return error(`"${input}" contains too many colons`);

    const x = parseFloat(parts[0]);
    if (Number.isNaN(x)) return error(`The [x] value of "${input}" is not a number`);

    const y = parseFloat(parts[1]);
    if (Number.isNaN(y)) return error(`The [y] value of "${input}" is not a number`);

    return AspectRatio.toObject(x, y);
  },

  /**
   * Greatest common divisor.
   * REF:
   *    https://en.wikipedia.org/wiki/Greatest_common_divisor
   */
  gcd(a: number, b: number) {
    if (b > a) {
      const temp = a;
      a = b;
      b = temp;
    }
    while (b != 0) {
      const m = a % b;
      a = b;
      b = m;
    }
    return a;
  },
};
