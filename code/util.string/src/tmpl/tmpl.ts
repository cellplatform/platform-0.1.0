/**
 * Replaces `"${variable}"` patterns within a string.
 */
export function format(text: string, variables: { [key: string]: string | number | boolean }) {
  Object.keys(variables).forEach(key => {
    const value = variables[key] || '';
    const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
    text = text.replace(regex, value.toString());
  });
  return text;
}
