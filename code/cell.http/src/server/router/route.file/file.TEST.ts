import { createMock, expect, FormData, fs, http, t } from '../../../test';

describe('route: file', () => {
  describe('invalid URI', () => {
    const test = async (path: string, expected: string) => {
      const mock = await createMock();
      const url = mock.url(path);
      const res = await http.get(url);
      await mock.dispose();

      const body = res.json();

      expect(res.status).to.eql(400);
      expect(body.error.type).to.eql('HTTP/uri/malformed');
      expect(body.error.message).to.contain('Malformed');
      expect(body.error.message).to.contain(expected);
    };

    it('malformed: no id', async () => {
      const msg = 'does not contain a namespace-identifier';
      await test('/file:.123', msg);
    });
  });

  describe('POST', () => {
    const post = async (args: {
      uri: string;
      queryString?: string;
      img?: string | string[];
      dispose?: boolean;
    }) => {
      const { uri } = args;
      const mock = await createMock();
      const form = new FormData();

      // Prepare the [multipart/form-data] to post.
      if (args.img) {
        const paths = Array.isArray(args.img) ? args.img : [args.img];
        for (const path of paths) {
          const img = await fs.readFile(fs.resolve(path));
          form.append('image', img, {
            filename: `image.png`,
            contentType: 'application/octet-stream',
          });
        }
      }

      // POST to the service.
      let url = mock.url(uri);
      url = args.queryString ? `${url}?${args.queryString || ''}` : url;
      const headers = form.getHeaders();
      const res = await http.post(url, form, { headers });

      // Finish up.
      if (args.dispose !== false) {
        mock.dispose();
      }
      const json = res.json<t.IResPostFile>();
      const data = json.data;
      const props = (data && data.props) || {};
      return { res, json, data, props, mock };
    };

    it('POST single file', async () => {
      const sourcePath = fs.resolve('src/test/images/bird.png');
      const savePath = fs.resolve('tmp/fs/ns.foo/bird');
      await fs.remove(savePath);

      const uri = 'file:foo.bird';
      const { res, json, data, props } = await post({
        uri,
        img: sourcePath,
      });

      expect(res.status).to.eql(200);
      expect(json.uri).to.eql(uri);
      expect(json.changes && json.changes.length).to.eql(3); // Changes returned by default.

      expect(data.hash).to.match(/^sha256-[0-9a-z]+/);
      expect(props.fileHash).to.match(/^sha256-[0-9a-z]+/);
      expect(data.hash).to.not.eql(props.fileHash); // Hash of model is different from raw file-data hash.

      // Ensure saved file matches POST'ed file.
      const sourceFile = await fs.readFile(sourcePath);
      const savedFile = await fs.readFile(savePath);
      expect(sourceFile.toString()).to.eql(savedFile.toString());
    });

    it('POST no changes returned (via query-string flag)', async () => {
      const { json } = await post({
        uri: 'file:foo.bird',
        img: 'src/test/images/bird.png',
        queryString: 'changes=false',
      });
      expect(json.changes).to.eql(undefined);
    });

    it('POST throws if no file posted', async () => {
      const { res } = await post({ uri: 'file:foo.bird' });
      expect(res.status).to.eql(400);

      const error = res.json<t.IHttpError>();
      expect(error.status).to.eql(400);
      expect(error.type).to.eql('HTTP/server');
      expect(error.message).to.contain('No file data was posted');
    });

    it('POST throws if no file posted', async () => {
      const { res } = await post({
        uri: 'file:foo.bird',
        img: ['src/test/images/bird.png', 'src/test/images/kitten.jpg'],
      });
      expect(res.status).to.eql(400);

      const error = res.json<t.IHttpError>();
      expect(error.status).to.eql(400);
      expect(error.type).to.eql('HTTP/server');
      expect(error.message).to.contain('Only a single file can be posted');
    });

    it('GET', async () => {
      const uri = 'file:foo.bird';
      const { mock } = await post({
        uri,
        img: 'src/test/images/bird.png',
        dispose: false,
      });

      const res = await http.get(mock.url(uri));
      mock.dispose();

      expect(res.status).to.eql(200);

      const json = res.json<t.IResGetFile>();
      const props = json.data.props;
      expect(json.uri).to.eql(uri);
      expect(props.name).to.eql('image.png');
      expect(props.mimetype).to.eql('image/png');
      expect(props.location).to.match(/^file:\/\//);
    });
  });
});
