/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:foo.messages
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.113
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
 *            import * as t from './<filename>;
 * 
 */

import * as t from '@platform/cell.types';

/**
 * Complete index of types available within the sheet.
 * Use by passing into a sheet at creation, for example:
 *
 *    const sheet = await TypedSheet.load<t.TypeIndex>({ ns, fetch });
 *
 */
export declare type TypeIndex = {
  MyMessages: MyMessages;
  MyColor: MyColor;
  MyMessage: MyMessage;
};

export declare type MyMessages = {
  channel: string;
  color?: t.ITypedSheetRef<TypeIndex, 'MyColor'>;
  messages: t.ITypedSheetRefs<TypeIndex, 'MyMessage'>;
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
