import { t, defaultValue, coord, value } from '../common';
import { TypeDefault, TypeValue, TypeTarget } from '../TypeSystem.core';

export type IArgs = {
  column: string | number;
  name: string;
  type?: t.CellType;
  target?: t.CellTypeTarget;
  default?: t.ITypeDefault | t.TypeDefaultValue;
  onChange?: OnPropChangeEventHandler;
};

export type OnPropChangeEvent = {
  prop: string;
  value: any;
};
export type OnPropChangeEventHandler = (e: OnPropChangeEvent) => void;

/**
 * Builder for a single column/property.
 */
export class TypeBuilderProp implements t.ITypeBuilderProp {
  public static create = (args: IArgs) => new TypeBuilderProp(args) as t.ITypeBuilderProp;

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this.column(args.column)
      .name(args.name)
      .type(defaultValue(args.type, 'string') as t.CellType)
      .target(args.target)
      .default(args.default);

    this._onChange = args.onChange;
  }

  /**
   * [Fields]
   */
  private _column: number = 0;
  private _name: string;
  private _type: t.CellType;
  private _target?: t.CellTypeTarget;
  private _default?: t.ITypeDefault | t.TypeDefaultValue;
  private _onChange?: OnPropChangeEventHandler;

  /**
   * [Properties]
   */
  private get columnKey() {
    return coord.cell.toColumnKey(this._column) || 'A';
  }

  /**
   * [Methods]
   */
  public toString() {
    return `column(${this.columnKey}):${this._name}`;
  }

  public toObject() {
    return value.deleteUndefined({
      column: this.columnKey,
      name: this._name,
      type: this._type,
      target: this._target,
      default: this._default,
    });
  }

  public column(value: string | number): t.ITypeBuilderProp {
    const index = typeof value === 'number' ? value : coord.cell.toAxisIndex('COLUMN', value);
    if (index < 0) {
      const err = `The column "${value}" is invalid.`;
      throw new Error(err);
    }
    this._column = index;
    return this.fireChange('column', this.columnKey);
  }

  public name(value: string): t.ITypeBuilderProp {
    this._name = value;
    return this.fireChange('name', value);
  }

  public type(value: t.CellType): t.ITypeBuilderProp {
    value = (value || '').trim();
    if (!value.startsWith('/')) {
      const parsed = TypeValue.parse(value);
      if (parsed.type.kind === 'UNKNOWN') {
        const err = `The type '${value}' is UNKNOWN`;
        throw new Error(err);
      }
    }
    this._type = value;
    return this.fireChange('type', value);
  }

  public target(value: t.CellTypeTarget | undefined): t.ITypeBuilderProp {
    const errors = TypeTarget.parse(value).errors;
    if (errors.length > 0) {
      const message = errors.map(err => err.message).join('\n');
      throw new Error(message);
    }
    this._target = value;
    return this.fireChange('target', value);
  }

  public default(value: t.ITypeDefault | t.TypeDefaultValue | undefined): t.ITypeBuilderProp {
    this._default = value;
    return this.fireChange('default', value);
  }

  /**
   * [Helpers]
   */
  private fireChange(prop: string, value: any) {
    if (this._onChange) {
      this._onChange({ prop, value });
    }
    return this;
  }
}
