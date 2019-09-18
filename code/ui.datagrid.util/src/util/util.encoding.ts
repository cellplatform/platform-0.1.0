/**
 * Remove encoding put onto values via editor Markdown parsing.
 */
export function removeMarkdownEncoding(value: string) {
  // Example: "1/.2" => "1.2"
  value = replaceMatch(/^\d+\\\.\d+/, value, (value, encoded) => {
    value = value.substring(encoded.length);
    return `${encoded.replace(/\\\./, '.')}${value}`;
  });

  // Example: "\-1.2" => "-1.2"
  value = replaceMatch(/^\\\-/, value, (value, encoded) => value.replace(/^\\\-/, '-'));

  return value;
}

/**
 * [Helpers]
 */
const replaceMatch = (
  pattern: RegExp,
  value: string,
  replace: (value: string, encoded: string) => string,
) => {
  const match = pattern.exec(value);
  return match ? replace(value, match[0]) : value;
};
