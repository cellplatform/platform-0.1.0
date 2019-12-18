type GetKey<T> = (input: T) => string;

/**
 * Sorts filenames in a semantically sensible (human) way.
 * Ref:
 *    https://support.apple.com/kb/TA22935?locale=en_US
 */
export function paths<T = string>(list: T[]) {
  return sortBy<T>(list, split as any);
}

/**
 * Sorts objects in a semantically sensible (human) way.
 * Ref:
 *    https://support.apple.com/kb/TA22935?locale=en_US
 */
export function objects<T>(list: T[], getKey: GetKey<T>) {
  return sortBy<T>(list, x => split(getKey(x)));
}

/**
 * [Helpers]
 */

function sortBy<T>(list: T[], split: (input: T) => string[]) {
  return list
    .map((value, i) => [split(value), value])
    .sort((a, b) => compare(a[0] as any, b[0] as any))
    .map(item => item[1]) as T[];
}

function padWith(char: string) {
  return (substring: string) => {
    const length = substring.length;
    return Array.from({ length }).join(char) + '0' + substring;
  };
}

/**
 * Force numbers into sensible order.
 * NB: Padding all numbers with 9's causes then to sort logically.
 */
const forceNumberOrder = (text: string) => text.replace(/\d+/g, padWith('9'));
const split = (text: string) => forceNumberOrder(text).split('/');

function compare(left: string, right: string) {
  const length = Math.min(left.length, right.length);
  for (let i = 0; i < length; i++) {
    if (left[i] === right[i]) {
      continue;
    }
    const res = left[i].localeCompare(right[i]);
    if (res !== 0) {
      return res;
    } else if (left > right) {
      return 1;
    } else if (left < right) {
      return -1;
    }
  }
  return left.length - right.length;
}
