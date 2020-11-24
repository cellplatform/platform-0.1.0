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
 *    @platform/cell.typesystem@0.0.141
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
  MyRow: MyRow;
  MyMessage: MyMessage;
  MyColor: MyColor;
  MyMessages: MyMessages;
};

export declare type MyRow = {
  title: string;
  isEnabled: boolean | null;
  color?: MyColor;
  message: t.ITypedSheetRef<TypeIndex, 'MyMessage'> | null;
  messages: t.ITypedSheetRefs<TypeIndex, 'MyMessage'>;
};

export declare type MyMessage = {
  date: number;
  user: string;
  message: string;
};

export declare type MyColor = {
  label: string;
  color: 'red' | 'green' | 'blue';
  description?: string;
};

export declare type MyMessages = {
  channel: string;
  color?: t.ITypedSheetRef<TypeIndex, 'MyColor'>;
  messages: t.ITypedSheetRefs<TypeIndex, 'MyMessage'>;
};
