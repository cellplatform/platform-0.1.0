const gravatarUrl = require('gravatar-url');

export type GravatarDefault =
  | '404'
  | 'mm'
  | 'identicon'
  | 'monsterid'
  | 'wavatar'
  | 'retro'
  | 'blank'
  | string;

/**
 * Generates the URL for a gravatar.
 */
export function url(
  email: string,
  options: {
    size?: number;
    default?: GravatarDefault;
    rating?: 'g' | 'pg' | 'r' | 'x';
  } = {},
) {
  return gravatarUrl(email, options);
}
