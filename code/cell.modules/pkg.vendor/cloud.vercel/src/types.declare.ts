/**
 * https://www.npmjs.com/package/js-sha1
 * https://github.com/emn178/js-sha1
 */
declare module 'js-sha1' {
  export function create(): Hasher;
}

type Hasher = {
  update(input: string | Uint8Array): Sha1;
  hex(): string;
};
type Sha1 = { bytes: number };
