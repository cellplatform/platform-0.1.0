  /**
   * Generated types defined in namespace:
   * 
   *    |                
   *    |➔  ns:foo
   *    |
   * 
   * By:
   *    module:  @platform/cell.http@0.6.65
   *    schema:  @platform/cell.schema@^0.4.50
   * 
   * Notes: 
   * 
   *    - DO NOT manually edit this file (it will be regenerated automatically).
   *    - DO check this file into source control.
   *    - Usage
   *        Import the [.d.ts] file within the consuming module
   *        that uses a [TypedSheet] to programatically manipulate 
   *        the namespace in a strongly-typed manner.
   * 
   */

export declare type MyRow = {
  title: string;
  isEnabled: boolean;
  color?: MyColor;
};

export declare type MyColor = {
  label: string;
  color: 'red' | 'green' | 'blue';
};
