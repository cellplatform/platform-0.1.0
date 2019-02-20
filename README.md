[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/uiharness/platform.svg?branch=master)](https://travis-ci.org/uiharness/platform)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fuiharness%2Fplatform.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fuiharness%2Fplatform?ref=badge_shield)
[![title](https://user-images.githubusercontent.com/185555/53066725-00d55d80-3536-11e9-9b22-e7286a9a4afc.png)](https://uiharness.com)

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

- [@platform/ts](/code/ts) 
- [@platform/fs](/code/fs)
- [@platform/cli](/code/cli)
- [@platform/test](/code/test)
- [@platform/log](/code/log)
- [@platform/electron](/code/electron)
- [@platform/react](/code/react)
- util
  - [@platform/util](/code/util)
  - [@platform/util.css](/code/util.css)
  - [@platform/util.exec](/code/util.exec)
  - [@platform/util.is](/code/util.is)
  - [@platform/util.value](/code/util.value)
- ui
  - [@platform/ui.editor](/code/ui.editor)
  - [@platform/ui.object](/code/ui.object)
  - [@platform/ui.text](/code/ui.editor)
- state
  - [@platform/hyperdb](/code/hyperdb)
  - [@platform/state](/code/state)


<p>&nbsp;</p>
<p>&nbsp;</p>


## License
It's [MIT](LICENSE) all the way!  

Plus...for a scintillating break down of this open-source classic, treat yourself to **Kyle E. Mitchell's**  
"[The MIT License, line-by-line. 171 words every programmer should understand.](https://writing.kemitchell.com/2016/09/21/MIT-License-Line-by-Line.html)"

<a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fuiharness%2Fplatform?ref=badge_large" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fuiharness%2Fplatform.svg?type=large"/></a>



## TODO
![pre-release](https://img.shields.io/badge/Status-pre--release-orange.svg)  
API's will change (probably radically 🐷) prior to `1.0` release.

- Rename
  - [x] `@platform/util.react` ➡️ `@platform/react` (unpublish `util.react` from NPM)
  - [x] `@platform/ts` ➡️ `@platform/ts.libs`
  - [x] `@platform/ts.cli` ➡️ `@platform/ts` (unpublish `ts.cli` from NPM)

