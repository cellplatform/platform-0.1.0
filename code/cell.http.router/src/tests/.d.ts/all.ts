/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:foo
 *    |➔  ns:foo.color
 *    |➔  ns:foo.messages
 *    |➔  ns:foo.message
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.33
 * 
 * Notes: 
 * 
 *    - DO NOT manually edit this file (it will be regenerated automatically).
 *    - DO check this file into source control.
 *    - Usage
 *        Import the [.d.ts] file within the consuming module
 *        that uses a [TypedSheet] to programatically manipulate 
 *        the namespace in a strongly-typed manner, for example:
 * 
 *            import * as t from './all.ts';
 * 
 */

import * as t from '@platform/cell.types';

export declare type MyRow = {
  title: string;
  isEnabled: boolean | null;
  color?: MyColor;
  message: t.ITypedSheetRef<MyMessage> | null;
  messages: t.ITypedSheetRefs<MyMessage>;
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

export declare type MyMessages = {
  channel: string;
  color?: t.ITypedSheetRef<MyColor>;
  messages: t.ITypedSheetRefs<MyMessage>;
};
