// import { t, fs, http, constants, HttpClient, log } from '../common';

// // https://dev.db.team/cell:ckhon6cdk000o6hetdrtmd0dt:A1/file/sample/index.json

// export const tmpHandler: t.RouteHandler = async (req) => {
//   try {
//     // const url = 'https://dev.db.team/cell:ckhon6cdk000o6hetdrtmd0dt:A1/file/sample/index.json';
//     const url = 'https://dev.db.team/cell:ckhon6cdk000o6hetdrtmd0dt:A1/file:qm003xq.js';

//     const GET = await http.get(url);
//     const PATH = constants.PATH;

//     const pathExists = {
//       tmp: await fs.pathExists(PATH.TMP),
//       module: await fs.pathExists(PATH.MODULE),
//       cacheDir: await fs.pathExists(PATH.CACHE_DIR),
//     };

//     const filePath = fs.join(PATH.TMP, 'my-file');
//     await fs.writeFile(filePath, 'Hello 🌳 \n');

//     const file = (await fs.readFile(filePath)).toString();

//     const bundle: t.RuntimeBundleOrigin = {
//       host: 'dev.db.team',
//       uri: 'cell:ckhon6cdk000o6hetdrtmd0dt:A1',
//       dir: 'sample',
//     };

//     log.info('bundle', bundle);

//     const client = HttpClient.create(bundle.host).cell(bundle.uri);
//     const clientFile = client.file.name('sample/index.json');

//     const res = await clientFile.download();

//     const downloadPath = fs.join(PATH.TMP, 'downloaded');
//     let fileload: any;
//     const error: any = undefined;
//     if (typeof res.body === 'object') {
//       try {
//         await fs.stream.save(downloadPath, res.body as any);
//         fileload = (await fs.readFile(downloadPath)).toString();
//         console.log('fileload', fileload);
//       } catch (error) {
//         log.error(error);
//         console.log('error', JSON.stringify(error));
//       }
//     }

//     return {
//       status: 200,
//       data: {
//         file,
//         PATH,
//         pathExists,
//         // GET: { url, res: GET },
//         download: {
//           status: res.status,
//           bodyType: typeof res.body,
//           downloadPath,
//           fileload,

//           body: res.body,
//           error,
//         },
//       },
//     };
//   } catch (error) {
//     log.error(error);
//     return { status: 500, data: { error } };
//   }
// };
