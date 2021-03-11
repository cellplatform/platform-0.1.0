// import { debounceTime } from 'rxjs/operators';
// import { Actions } from 'sys.ui.dev';

// import { CodeEditor } from '../../api';
// import { bundle, HttpClient, rx, StateObject, t, Schema } from '../../common';

// export function SaveTest(editor: t.CodeEditorInstance) {
//   editor.events.text$.pipe(debounceTime(500)).subscribe(() => {
//     const text = editor.text;
//     if (text) save(text);
//   });

//   const binary = new TextEncoder();

//   // const client = HttpClient.create(8080);
//   const client = HttpClient.create(5000);
//   // const client = HttpClient.create('dev.db.team');

//   const save = async (text: string) => {
//     const uri = 'cell:ckgu71a83000dl0et1676dq9y:A1';
//     const fs = client.cell(uri).fs;

//     console.group('🌳 save');
//     console.log('origin', client.origin);

//     console.log('uri', uri);

//     // const blob = new Blob([text], { type: 'text/plain' });
//     // const data = await blob.arrayBuffer();
//     // const d = blob.

//     // const file = new File(['foo'], 'foo.txt', {
//     //   type: 'text/plain',
//     // });

//     // const data = await file.arrayBuffer();
//     // const array = binary.encode(text);
//     // const data = new Blob([array.buffer], { type: 'text/plain' }) as any;

//     // console.log('data', data);

//     const array = binary.encode(text);
//     // const data = new Blob([array], { type: 'plain/text' });

//     const data = array;
//     // const data = array.buffer;

//     console.log('data', data);
//     const filename = 'src/file.ts.txt';
//     const uploaded = await fs.upload({ filename, data });
//     console.log('uploaded', uploaded);
//     console.log('errors', uploaded.body.errors[0]);

//     const url = Schema.urls(client.origin).cell(uri).file.byName(filename);
//     console.log('url', url.toString());

//     console.groupEnd();
//   };
// }
