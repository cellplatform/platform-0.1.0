import * as React from 'react';
import * as ReactDOM from 'react-dom';

/**
 * Determines whether any element within the child DOM hierarchy
 * is focused.
 */
export function containsFocus(instance: React.ReactInstance) {
  try {
    const el = ReactDOM.findDOMNode(instance);
    const active = document.activeElement;
    return el ? el.contains(active) : false;
  } catch (error) {
    // NB:  Will fail when call with unmounted `instance`.
    //      As an unmounted component by definition it does not contain focus.
    return false;
  }
}

/**
 * Copies the given text to the clipboard.
 */
export function copyToClipboard(text: string) {
  try {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  } catch (error) {
    const err = `Failed to copy text to clipboard.\n\n${text}`;
    console.error(err); // tslint:disable-line
  }
}
