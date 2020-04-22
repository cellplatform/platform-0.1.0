import { t, ERROR } from '../../common';
import { TypeScript } from '../TypeScript';

type ParsedTypeProp = { type: string; prop: string; error?: t.IError };

/**
 * Parser for interpreting a [prop] reference within an [ITypeDef].
 */
export class TypeProp {
  public static parse(input?: string | t.ITypeDef): ParsedTypeProp {
    input = input || '';
    const text = ((typeof input === 'string' ? input : input.prop) || '').trim();
    const index = text.indexOf('.');

    // Parse parts.
    const type = (index > -1 ? text.substring(0, index) : '').trim();
    const prop = (index > -1 ? text.substring(index + 1) : '').trim();

    // Format error.
    let message: string | undefined;
    const shouldBeFormat = 'Should be <Typename.propname>';

    if (!text) {
      message = `Value of 'prop' not provided for type.`;
    } else if (!prop) {
      message = `Value of 'prop' does not contain a name. ${shouldBeFormat} (given "${text}")`;
    } else if (!type) {
      message = `Value of 'prop' does not contain a typename. ${shouldBeFormat} (given "${text}")`;
    }

    if (!message) {
      const res = TypeScript.validate.propname(prop);
      message = res.error ? res.error : message;
    }

    if (!message) {
      const res = TypeScript.validate.objectTypename(type);
      message = res.error ? res.error : message;
    }

    if (!message && prop && prop.indexOf('.') > -1) {
      message = `Value of 'prop' is too deep (ie. too many periods). ${shouldBeFormat} (given "${text}")`;
    }

    // Finish up.
    const error: t.IError | undefined = message
      ? { message, type: ERROR.TYPE.DEF_INVALID }
      : undefined;
    return { type, prop, error };
  }
}
