import { expect } from 'chai';
import { hash } from '.';

const circular: any = { foo: 123 };
circular.ref = circular;

describe('hash', () => {
  it('SHA-256', () => {
    const test = (input: any, output: string) => {
      const res = hash.sha256(input);
      expect(res).to.eql(output);
    };

    test(123, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');

    test(undefined, 'eb045d78d273107348b0300c01d29b7552d622abbc6faf81b3ec55359aa9950c');
    test(null, '74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b');
    test({}, '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a');
    test({ foo: 123 }, '8ae301e76251dfa937e27312e3f89be4941c49e2094f3dafe614ed3c8235fbf9');
    test(circular, '4a0d7fbcc50b3dbe9d4e65b2035fcdfd5b3bbef0114f4253ec8fe1d5a63d31fd');
    test([], '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945');
    test([1, { item: 2 }], 'f7208eee7228130d67fbe6ebba391b08d4157e0a21d19e456841b8a6a2f3f837');
    test([1, circular], 'a02db2a9697ffa28bb6905387565ba07d56197584c95b4f78c24a5aa35da71e7');
    test(true, 'b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b');
    test(false, 'fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa');
    test(123, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');
    test(BigInt(9999), '888df25ae35772424a560c7152a1de794440e0ea5cfee62828333a456a506e05');
    test((i: number) => i, '2999ded775385cd9cc16979ebb1b76ee3288644725f9eae8724930b715f2ed91');
    test(Symbol('foo'), '4e0174a44fe97d168404051e1e629322b4ce370d0dd47d5361caa4b4f8db9f3e');
  });
});
