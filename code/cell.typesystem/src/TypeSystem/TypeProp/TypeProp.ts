import { t, ERROR } from '../../common';

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
    const shouldBeSyntax = 'Should be alpha-numeric and not start with a number.';

    if (!text) {
      message = `Value of 'prop' not provided for type.`;
    } else if (!prop) {
      message = `Value of 'prop' does not contain a name. Given "${text}". ${shouldBeFormat}`;
    } else if (!type) {
      message = `Value of 'prop' does not contain a typename. Given "${text}". ${shouldBeFormat}`;
    }
    if (prop && prop.indexOf('.') > -1) {
      message = `Value of 'prop' is too deep (ie. too many periods). Given "${text}". ${shouldBeFormat}`;
    }

    if (!message) {
      if (prop && !isValid(prop)) {
        message = `Value of 'prop' contains an invalid name. Given "${text}". ${shouldBeSyntax}`;
      }

      if (type && !isValid(type)) {
        message = `Value of 'prop' contains an invalid typename. Given "${text}". ${shouldBeSyntax}`;
      }
    }

    // Finish up.
    const error: t.IError | undefined = message ? { message, type: ERROR.TYPE.PROP } : undefined;
    return { type, prop, error };
  }
}

/**
 * [Helpers]
 */
function isValid(text: string) {
  const match = text.match(/^\D[\w\d]*/);
  return match ? match[0].length === text.length : false;
}
