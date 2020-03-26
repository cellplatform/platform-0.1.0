/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:foo.messages
 *    |
 * 
 * By:
 *    @platform/cell.schema@0.4.66
 * 
 * Notes: 
 * 
 *    - DO NOT manually edit this file (it will be regenerated automatically).
 *    - DO check this file into source control.
 *    - Usage
 *        Import the [.d.ts] file within the consuming module
 *        that uses a [TypedSheet] to programatically manipulate 
 *        the namespace in a strongly-typed manner. eg:
 * 
 *            import * as t from './<filename>.d.ts';
 * 
 */

export declare type MyMessages = {
  channel: string;
  color: MyColor;
  messages: MyMessage[];
};

export declare type MyColor = {
  label: string;
  color: 'red' | 'green' | 'blue';
  description?: string;
};

export declare type MyMessage = {
  date: number;
  user: string;
  message: string;
};
