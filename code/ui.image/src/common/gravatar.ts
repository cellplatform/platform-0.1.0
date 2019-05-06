const gravatarUrl = require('gravatar-url');

/**
 * Generates the URL for a gravatar.
 */
export function url(
  email: string,
  options: {
    size?: number;
    default?: '404' | 'mm' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'blank' | string;
    rating?: 'g' | 'pg' | 'r' | 'x';
  } = {},
) {
  return gravatarUrl(email, options);
}
