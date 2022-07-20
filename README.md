[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![banner](https://user-images.githubusercontent.com/185555/88729229-76ac1280-d187-11ea-81c6-14146ec64848.png)

[Monorepo](https://en.wikipedia.org/wiki/Monorepo) for [@platform](https://www.npmjs.com/org/platform) modules.

<p>&nbsp;</p>
<p>&nbsp;</p>



## Philosophy

As quoted on [@isaacs](https://www.npmjs.com/~isaacs) post ["Unix Philosophy and Node.js"](https://blog.izs.me/2013/04/unix-philosophy-and-nodejs), [Doug McIlroy's](https://en.wikipedia.org/wiki/Douglas_McIlroy) 4-point formulation of the [Unix Philosophy](http://www.catb.org/esr/writings/taoup/html/ch01s06.html):

<p>&nbsp;</p>

1. **Make each program do one thing well.**  
   To do a new job, build afresh rather than complicate old programs by adding new features.


2. **Expect the output of every program to become the input to another, as yet unknown, program.**  
   Don’t clutter output with extraneous information. Avoid stringently columnar or binary input formats. Don’t insist on interactive input.


3. **Design and build software, even operating systems, to be tried early, ideally within weeks.**  
Don’t hesitate to throw away the clumsy parts and rebuild them.


4. **Use tools in preference to unskilled help to lighten a programming task**,  
   even if you have to detour to build the tools and expect to throw some of them out after you’ve finished using them.

<p>&nbsp;</p>

[@isaacs](https://www.npmjs.com/~isaacs) follows this up with a thoughtful translation into [nodejs](https://nodejs.org) terms. His [whole post](https://blog.izs.me/2013/04/unix-philosophy-and-nodejs) is worth the read, but here's a distillation:

- **Working** is better than perfect.
- **Focus** is better than features.
- **Compatibility** is better than purity.
- **Simplicity** is better than anything.

<p>&nbsp;</p>
<p>&nbsp;</p>


## Modules

- [@platform/types](/code/types) 
- [@platform/ts](/code/ts) 
- [@platform/log](/code/log)
- [@platform/exec](/code/exec)
- [@platform/tmpl](/code/tmpl)
- util
  - [@platform/util.animate](/code/util.animate)
  - [@platform/util.diff](/code/util.diff)
  - [@platform/util.hash](/code/util.hash)
  - [@platform/util.is](/code/util.is)
  - [@platform/util.local-storage](/code/util.local-storage)
  - [@platform/util.markdown](/code/util.markdown)
  - [@platform/util.string](/code/util.string)
  - [@platform/util.value](/code/util.value)
- fs
  - [@platform/fs](/code/fs)
  - [@platform/fs.watch](/code/fs.watch)
  - [@platform/fs.s3](/code/fs.s3)
  - [@platform/fs.s3](/code/fs.s3.types)
- fsdb
  - [@platform/fsdb.types](/code/fsdb.types)
  - [@platform/fsdb.file](/code/fsdb.file)
  - [@platform/fsdb.nedb](/code/fsdb.nedb)
  - [@platform/fsdb.mongo](/code/fsdb.mongo)
  - [@platform/fsdb.pg](/code/fsdb.pg)
- network
  - [@platform/http](/code/http)
  - [@platform/http](/code/http.types)
  - [@platform/http.router](/code/http.router)
  - [@platform/graphql](/code/graphql)
- cell
  - [@platform/cell.types](/code/cell.types)
  - [@platform/cell.schema](/code/cell.schema)
  - [@platform/cell.coord](/code/cell.coord)
  - [@platform/cell.value](/code/cell.value)
  - [@platform/cell.func](/code/cell.func)
  - [@platform/cell.func.sys](/code/cell.func.sys)
  - [@platform/cell.db](/code/cell.db)
  - [@platform/cell.http](/code/cell.http)
  - [@platform/cell.client](/code/cell.client)
  - [@platform/cell.fs](/code/cell.fs)
  - [@platform/cell.fs.sync](/code/cell.fs.sync)
  - [@platform/cell.compile](/code/cell.compile)
  - [@platform/cell.compile.web](/code/cell.compile.web)
  - [@platform/cell.cli](/code/cell.cli)
  - [@platform/cell.tmpl](/code/cell.tmpl)
  - [@platform/cell.ui](/code/cell.ui)
  - [@platform/cell.ui.sys](/code/cell.ui.sys)
  - ui
    - [@platform/cell.ui](/code/cell.ui)
    - [@platform/cell.ui.sys](/code/cell.ui.sys)
- ui
  - [@platform/css](/code/css)
  - [@platform/react](/code/react)
  - [@platform/react.ssr](/code/react.ssr)
- ui (primitives)
  - [@platform/ui.loader](/code/ui.loader)
  - [@platform/ui.button](/code/ui.button)
  - [@platform/ui.codemirror](/code/ui.codemirror)
  - [@platform/ui.editor](/code/ui.editor)
  - [@platform/ui.graphql](/code/ui.graphql)
  - [@platform/ui.icon](/code/ui.icon)
  - [@platform/ui.image](/code/ui.image)
  - [@platform/ui.monaco](/code/ui.monaco)
  - [@platform/ui.object](/code/ui.object)
  - [@platform/ui.panel](/code/ui.panel)
  - [@platform/ui.spinner](/code/ui.spinner)
  - [@platform/ui.text](/code/ui.text)
- ui.shell
  - [@platform/ui.shell](/code/ui.shell.types)
  - [@platform/ui.shell](/code/ui.shell)
  - [@platform/ui.shell](/code/ui.doc)
- state
  - [@platform/state](/code/state)
  - [@platform/state.react](/code/state.react)
  - [@platform/cache](/code/cache)
- testing
  - [@platform/test](/code/test)
  - [@platform/test.dom](/code/test.dom)
- cli
  - [@platform/cli](/code/cli)
  - [@platform/cli.spec](/code/cli.spec)
- npm
  - [@platform/npm](/code/npm)
  - [@platform/npm.express](/code/npm.express)
- auth
  - [@platform/auth](/code/auth)
  - [@platform/auth0](/code/auth0)
- communications
  - [@platform/conversation.db](/code/conversation.db)
  - [@platform/conversation.ui](/code/conversation.ui)
  - [@platform/mail](/code/mail)


<p>&nbsp;</p>
<p>&nbsp;</p>


## License
It's [MIT](LICENSE) all the way!  

Plus...for a scintillating break down of this open-source classic, treat yourself to **Kyle E. Mitchell's**  
"[The MIT License, line-by-line. 171 words every programmer should understand.](https://writing.kemitchell.com/2016/09/21/MIT-License-Line-by-Line.html)"

<a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fuiharness%2Fplatform?ref=badge_large" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fuiharness%2Fplatform.svg?type=large"/></a>



## Be Forewarned
![pre-release](https://img.shields.io/badge/Status-pre--release-orange.svg)  
API's will change (probably radically 🐷) prior to `1.0` release.

