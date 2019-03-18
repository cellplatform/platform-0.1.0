import { expect } from 'chai';
import * as ast from './ast';

describe('ast.toTokens', () => {
  it('converts to tokens', () => {
    const tokens = ast.toTokens('SUM(1, 23)');
    expect(tokens.length).to.eql(5);
    const first = tokens[0];
    const last = tokens[tokens.length - 1];

    expect(first.type).to.eql('function');
    expect(first.value).to.eql('SUM');
    expect(first.subtype).to.eql('start');

    expect(last.type).to.eql('function');
    expect(last.subtype).to.eql('stop');
  });
});

describe('ast.toTree', () => {
  it('empty', () => {
    const EMPTY: ast.EmptyNode = { type: 'empty' };
    expect(ast.toTree()).to.eql(EMPTY);
    expect(ast.toTree('')).to.eql(EMPTY);
    expect(ast.toTree('   ')).to.eql(EMPTY);
    expect(ast.toTree('=')).to.eql(EMPTY);
    expect(ast.toTree(' =  ')).to.eql(EMPTY);
  });

  it('parse-error', () => {
    const ERROR: ast.ParseErrorNode = { type: 'parse-error' };
    expect(ast.toTree('&^%')).to.eql(ERROR);
  });

  it('binary-expression', () => {
    const tree = ast.toTree('1 < 3');
    expect(tree.type).to.eql('binary-expression');
    const res = tree as ast.BinaryExpressionNode;
    expect(res.operator).to.eql('<');
    expect(res.left.type).to.eql('number');
    expect((res.left as ast.NumberNode).value).to.eql(1);
    expect(res.right.type).to.eql('number');
    expect((res.right as ast.NumberNode).value).to.eql(3);
  });

  it('unary-expression', () => {
    const tree = ast.toTree('-TRUE');
    expect(tree.type).to.eql('unary-expression');
    const res = tree as ast.UnaryExpressionNode;
    expect(res.operator).to.eql('-');
    expect(res.operand.type).to.eql('logical');
    expect((res.operand as ast.LogicalNode).value).to.eql(true);
  });

  it('logical: TRUE', () => {
    const tree = ast.toTree('TRUE');
    expect(tree.type).to.eql('logical');
    const res = tree as ast.LogicalNode;
    expect(res.value).to.eql(true);
  });

  it('logical: FALSE', () => {
    const tree = ast.toTree('FALSE');
    expect(tree.type).to.eql('logical');
    const res = tree as ast.LogicalNode;
    expect(res.value).to.eql(false);
  });

  it('text', () => {
    const tree = ast.toTree('"hello"');
    expect(tree.type).to.eql('text');
    const res = tree as ast.TextNode;
    expect(res.value).to.eql('hello');
  });

  it('number', () => {
    const tree = ast.toTree('2');
    expect(tree.type).to.eql('number');
    const res = tree as ast.NumberNode;
    expect(res.value).to.eql(2);
  });

  describe('cell', () => {
    it('REF', () => {
      const test = (
        input: string,
        space: string | undefined,
        refType: string,
        key: string,
        sheet?: string,
      ) => {
        const cell = ast.toTree(input) as ast.CellNode;
        expect(cell.type).to.eql('cell');
        expect(cell.space).to.eql(space);
        expect(cell.refType).to.eql(refType);
        expect(cell.key).to.eql(key);
        expect(cell.sheet).to.eql(sheet);
      };

      // No sheet.
      test('A1', undefined, 'relative', 'A1');
      test('=A1', undefined, 'relative', 'A1');
      test(' =  A1', undefined, 'relative', 'A1');
      test(' A1  ', undefined, 'relative', 'A1');
      test('!A1', undefined, 'relative', 'A1');
      test('$A1', undefined, 'mixed', '$A1');
      test('A$1', undefined, 'mixed', 'A$1');
      test(' $A$1 ', undefined, 'absolute', '$A$1');

      // Sheet.
      test(' Sheet1!A1 ', undefined, 'relative', 'A1', 'Sheet1');
      test('=Sheet1!A1', undefined, 'relative', 'A1', 'Sheet1');
      test(' Sheet1.sys!A1  ', 'sys', 'relative', 'A1', 'Sheet1');
      test(' =Sheet1.sys!A1  ', 'sys', 'relative', 'A1', 'Sheet1');
      test('  =  Sheet1.sys!A1  ', 'sys', 'relative', 'A1', 'Sheet1');
      test('Sheet1!$A1 ', undefined, 'mixed', '$A1', 'Sheet1');
      test('Sheet1!A$1 ', undefined, 'mixed', 'A$1', 'Sheet1');
      test('Sheet1!$A$1 ', undefined, 'absolute', '$A$1', 'Sheet1');
    });

    it('function parameter REF', () => {
      const test = (
        input: string,
        space: string | undefined,
        refType: string,
        key: string,
        sheet?: string,
      ) => {
        const tree = ast.toTree(input);
        const arg = (tree as ast.FunctionNode).arguments[1] as ast.CellNode;
        expect(arg.type).to.eql('cell');
        expect(arg.space).to.eql(space);
        expect(arg.refType).to.eql(refType);
        expect(arg.key).to.eql(key);
        expect(arg.sheet).to.eql(sheet);
      };

      // No sheet.
      test('SUM(4, A1)', undefined, 'relative', 'A1');
      test('=SUM(4, A1)', undefined, 'relative', 'A1');
      test('=SUM(4, $A1)', undefined, 'mixed', '$A1');
      test('=SUM(4, A$1)', undefined, 'mixed', 'A$1');

      // Sheet.
      test('SUM(4, Sheet1!A1)', undefined, 'relative', 'A1', 'Sheet1');
      test('=SUM(4, Sheet1!A1)', undefined, 'relative', 'A1', 'Sheet1');
      test('=SUM(4, Sheet1!A$1)', undefined, 'mixed', 'A$1', 'Sheet1');
      test('=SUM(4, Sheet1!$A1)', undefined, 'mixed', '$A1', 'Sheet1');
      test('=SUM(4, Sheet1.sys!A1)', 'sys', 'relative', 'A1', 'Sheet1');
    });
  });

  describe('cell-range', () => {
    it('simple range', () => {
      const tree = ast.toTree('A1:$B$1');
      expect(tree.type).to.eql('cell-range');

      const range = tree as ast.CellRangeNode;
      expect(range.sheet).to.eql(undefined);

      const left = range.left as ast.CellNode;
      expect(left.refType).to.eql('relative');
      expect(left.key).to.eql('A1');
      expect(left.space).to.eql(undefined);

      const right = range.right as ast.CellNode;
      expect(right.refType).to.eql('absolute');
      expect(right.key).to.eql('$B$1');
      expect(right.space).to.eql(undefined);
    });

    it('range with sheet (DEFAULT)', () => {
      const range = ast.toTree<ast.CellRangeNode>('Sheet1!A1:$B$1');

      expect(range.sheet).to.eql('Sheet1');

      expect(range.left.key).to.eql('A1');
      expect(range.left.sheet).to.eql('Sheet1');
      expect(range.left.refType).to.eql('relative');
      expect(range.left.space).to.eql(undefined);

      expect(range.right.key).to.eql('$B$1');
      expect(range.right.sheet).to.eql('Sheet1');
      expect(range.right.refType).to.eql('absolute');
      expect(range.right.space).to.eql(undefined);
    });

    it('range with sheet (SYSTEM)', () => {
      const range = ast.toTree<ast.CellRangeNode>('Sheet1.sys!A1:$B$1');
      expect(range.left.key).to.eql('A1');
      expect(range.right.key).to.eql('$B$1');

      expect(range.left.sheet).to.eql('Sheet1');
      expect(range.right.sheet).to.eql('Sheet1');

      expect(range.left.space).to.eql('sys');
      expect(range.right.space).to.eql('sys');
    });

    it('complex range', () => {
      const tree: any = ast.toTree('E6:E10,F8,H16:H18');
      expect(tree.type).to.eql('binary-expression');
      expect(tree.left.left.left.key).to.eql('E6');
      expect(tree.left.left.right.key).to.eql('E10');
      expect(tree.left.right.key).to.eql('F8');
      expect(tree.right.left.key).to.eql('H16');
      expect(tree.right.right.key).to.eql('H18');
    });

    it('range with "=" prefix', () => {
      expect(ast.toTree('=A1:A5').type).to.eql('cell-range');
      expect(ast.toTree('= A1:A5').type).to.eql('cell-range');
      expect(ast.toTree('   =   A1:A5').type).to.eql('cell-range');
      expect(ast.toTree('=(A1:A5)').type).to.eql('cell-range');
      expect(ast.toTree(' =  (  A1:A5 )').type).to.eql('cell-range');
    });

    it('range with only one side', () => {
      const test = (source: string, leftKey: string, rightKey: string) => {
        const node = ast.toTree(source) as ast.CellRangeNode;
        expect(node.left.key).to.eql(leftKey);
        expect(node.right.key).to.eql(rightKey);
      };

      test(':', '', '');
      test('A1:', 'A1', '');
      test(':B5', '', 'B5');
    });

    it('range strips "=" and "()"', () => {
      const test = (source: string, leftKey: string, rightKey: string) => {
        const node = ast.toTree(source) as ast.CellRangeNode;
        expect(node.left.key).to.eql(leftKey);
        expect(node.right.key).to.eql(rightKey);
      };
      test('=:', '', '');
      test(' = :', '', '');
      test('=(:)', '', '');
      test('  =  ( :  )  ', '', '');
      test('=A1:', 'A1', '');
      test('=A1:B5', 'A1', 'B5');
      test('=(A1:B5)', 'A1', 'B5');
    });
  });

  describe('function', () => {
    type Func = ast.FunctionNode;

    it('SUM (2 args)', () => {
      const func = ast.toTree<Func>('SUM(1, 2)');
      expect(func.type).to.eql('function');
      expect(func.name).to.eql('SUM');
      expect(func.namespace).to.eql(undefined);
      expect(func.arguments.length).to.eql(2);
      expect(func.arguments[0].type).to.eql('number');
      expect(func.arguments[1].type).to.eql('number');
    });

    it('SUM (no args)', () => {
      expect(ast.toTree<Func>('SUM()').arguments.length).to.eql(0);
      expect(ast.toTree<Func>('SUM( )').arguments.length).to.eql(0);
      expect(ast.toTree<Func>('SUM(   )').arguments.length).to.eql(0);
    });

    it('namespace (single)', () => {
      const func = ast.toTree<Func>('system.FOO()');
      expect(func.name).to.eql('FOO');
      expect(func.namespace).to.eql('system');
    });

    it('namespace (deep)', () => {
      const func = ast.toTree<Func>('root.parent.child.FOO()');
      expect(func.name).to.eql('FOO');
      expect(func.namespace).to.eql('root.parent.child');
    });

    it('number args (positive/negative)', () => {
      const tree = ast.toTree('=SUM(1, -1.618)');
      const args = (tree as ast.FunctionNode).arguments as any[];
      expect(args[0].type).to.eql('number');
      expect(args[0].value).to.eql(1);
      expect(args[1].type).to.eql('number');
      expect(args[1].value).to.eql(-1.618);
    });

    it('TRUE/FALSE args as logical', () => {
      const tree = ast.toTree('=FOO(TRUE, FALSE)');
      const args = (tree as ast.FunctionNode).arguments as any[];
      expect(args[0].type).to.eql('logical');
      expect(args[0].value).to.eql(true);
      expect(args[1].type).to.eql('logical');
      expect(args[1].value).to.eql(false);
    });

    it('true/false (boolean) args as logical', () => {
      const tree = ast.toTree('=FOO(true, false)');
      const args = (tree as ast.FunctionNode).arguments as any[];
      expect(args[0].type).to.eql('logical');
      expect(args[0].value).to.eql(true);
      expect(args[1].type).to.eql('logical');
      expect(args[1].value).to.eql(false);
    });
  });
});
