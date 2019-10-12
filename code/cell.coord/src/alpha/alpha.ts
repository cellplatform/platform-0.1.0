import { MemoryCache } from '../common';

const cache = MemoryCache.create();

/**
 * Converts a number to an alphabetic character.
 * Eg:
 *    - 0  => A
 *    - 1  => B
 *    - 25 => Z
 *    - 26 => AA
 *    - 27 => AB
 *    - ...etc.
 */
export function toCharacter(index: number) {
  if (index < 0) {
    return undefined;
  }
  return cache.get(`toCharacter/${index}`, () => {
    let colName = '';
    let dividend = Math.floor(Math.abs(index + 1));
    let rest: number;

    while (dividend > 0) {
      rest = (dividend - 1) % 26;
      colName = String.fromCharCode(65 + rest) + colName;
      dividend = parseInt(((dividend - rest) / 26).toString(), 10);
    }
    return colName;
  });
}

/**
 * Converts an alpha character to it's corresponding index.
 * Eg:
 *    - A  => 1
 *    - Z  => 26
 *    - AA => 27
 *    ...etc.
 */
export function fromCharacter(value?: string) {
  return cache.get(`fromCharacter/${value}`, () => {
    value = value ? value.trim() : value;
    if (!value) {
      return undefined;
    }

    const digits = value.toUpperCase().split('');
    let number = 0;

    for (let i = 0; i < digits.length; i++) {
      number += (digits[i].charCodeAt(0) - 64) * Math.pow(26, digits.length - i - 1);
    }

    number--;
    return number < 0 ? undefined : number;
  });
}
