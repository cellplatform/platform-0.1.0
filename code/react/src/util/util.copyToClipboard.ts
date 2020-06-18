/**
 * Copies the given text to the clipboard.
 */
export const copyToClipboard = (text: string) => {
  try {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  } catch (error) {
    const err = `Failed to copy text to clipboard.\n\n${text}`;
    console.error(err); // eslint-disable-line
  }
};
