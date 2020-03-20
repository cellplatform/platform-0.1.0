import { createMock, expect, expectFileInFs, readFile } from '../test';

describe('cell/files: delete, unlink', () => {
  it('delete and/or unlink files from cell', async () => {
    const mock = await createMock();
    const A1 = 'cell:foo:A1';
    const clientA1 = mock.client.cell(A1);

    const file1 = await readFile('src/test/assets/func.wasm');
    const file2 = await readFile('src/test/assets/kitten.jpg');
    const file3 = await readFile('src/test/assets/bird.png');
    const file4 = await readFile('src/test/assets/foo.json');

    await clientA1.files.upload([
      { filename: 'func.wasm', data: file1 },
      { filename: 'kitten.jpg', data: file2 },
      { filename: 'cat&bird.png', data: file3 },
      { filename: 'foo.json', data: file4 },
    ]);

    const res1 = await clientA1.files.list();
    expect(res1.body.length).to.eql(4);

    await expectFileInFs(res1.body[0].uri, true);
    await expectFileInFs(res1.body[1].uri, true);
    await expectFileInFs(res1.body[2].uri, true);
    await expectFileInFs(res1.body[3].uri, true);

    const res2 = await clientA1.files.delete(['', '  ']); // NB: All values collapse to nothing.
    expect(res2.status).to.eql(200);
    expect(res2.body.deleted).to.eql([]);
    expect(res2.body.unlinked).to.eql([]);
    expect(res2.body.errors).to.eql([]);

    // Delete single file.
    const res3 = await clientA1.files.delete('cat&bird.png');
    expect(res3.ok).to.eql(true);
    expect(res3.status).to.eql(200);
    expect(res3.body.uri).to.eql('cell:foo:A1');
    expect(res3.body.deleted).to.eql(['cat&bird.png']);
    expect(res3.body.unlinked).to.eql(['cat&bird.png']);
    expect(res3.body.errors).to.eql([]);

    // Ensure files have been deleted from the underlying file-system.
    await expectFileInFs(res1.body[0].uri, true);
    await expectFileInFs(res1.body[1].uri, true);
    await expectFileInFs(res1.body[2].uri, false);
    await expectFileInFs(res1.body[3].uri, true);
    expect((await clientA1.files.list()).body.length).to.eql(3);

    // Ensure the links is removed from the cell.
    const links = (await clientA1.info()).body.data.links || {};
    expect(links['fs:cat&bird:png']).to.eql(undefined); //   Unlinked and deleted.
    expect(links['fs:func:wasm']).to.not.eql(undefined); //  Remains.
    expect(links['fs:kitten:jpg']).to.not.eql(undefined); // Remains.

    // Remove multiple-files at once.
    const res4 = await clientA1.files.delete(['func.wasm', 'foo.json']);
    expect(res4.body.deleted.sort()).to.eql(['foo.json', 'func.wasm']);
    expect(res4.body.unlinked.sort()).to.eql(['foo.json', 'func.wasm']);
    expect(res4.body.errors).to.eql([]);

    // Ensure files have been deleted from the underlying file-system.
    await expectFileInFs(res1.body[0].uri, false);
    await expectFileInFs(res1.body[1].uri, true);
    await expectFileInFs(res1.body[2].uri, false);
    await expectFileInFs(res1.body[3].uri, false);
    expect((await clientA1.files.list()).body.length).to.eql(1);

    // Report error for a delete request that is not linked to the cell.
    const res5 = await clientA1.files.delete('not-linked.pdf');
    expect(res5.ok).to.eql(false);
    expect(res5.status).to.eql(500);
    expect(res5.body.errors.length).to.eql(1);
    expect(res5.body.errors[0].error).to.eql('NOT_LINKED');

    // Finish up.
    await mock.dispose();
  });

  it('unlink files from cell', async () => {
    const mock = await createMock();
    const A1 = 'cell:foo:A1';
    const clientA1 = mock.client.cell(A1);

    const file1 = await readFile('src/test/assets/func.wasm');
    const file2 = await readFile('src/test/assets/kitten.jpg');
    const file3 = await readFile('src/test/assets/foo.json');

    await clientA1.files.upload([
      { filename: 'func.wasm', data: file1 },
      { filename: 'kitten.jpg', data: file2 },
      { filename: 'foo.json', data: file3 },
    ]);

    const res1 = await clientA1.files.list();
    expect(res1.body.length).to.eql(3);

    // Unlink (one).
    const res2 = await clientA1.files.unlink('kitten.jpg');
    expect(res2.body.deleted).to.eql([]);
    expect(res2.body.unlinked).to.eql(['kitten.jpg']);
    expect(res2.body.errors).to.eql([]);

    const res3 = await clientA1.files.unlink(['foo.json', 'func.wasm']);
    expect(res3.body.deleted).to.eql([]);
    expect(res3.body.unlinked).to.eql(['foo.json', 'func.wasm']);
    expect(res3.body.errors).to.eql([]);

    // Ensure file remains on file-system, but is not linked to the cell model.
    await expectFileInFs(res1.body[0].uri, true);
    await expectFileInFs(res1.body[1].uri, true);
    await expectFileInFs(res1.body[2].uri, true);
    expect((await clientA1.files.list()).body.length).to.eql(0);

    // Finish up.
    await mock.dispose();
  });

  it('fails when unlinking a file that is not referenced by the cell', async () => {
    const mock = await createMock();
    const A1 = 'cell:foo:A1';
    const clientA1 = mock.client.cell(A1);

    const data = await readFile('src/test/assets/func.wasm');
    await clientA1.files.upload([{ filename: 'func.wasm', data }]);

    const res = await clientA1.files.unlink('kitten.jpg');
    const errors = res.body.errors;

    expect(errors.length).to.eql(1);
    expect(errors[0]).to.eql({ error: 'NOT_LINKED', filename: 'kitten.jpg' });

    // Finish up.
    await mock.dispose();
  });
});
