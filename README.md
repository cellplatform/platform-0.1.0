[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![banner](https://user-images.githubusercontent.com/185555/88729229-76ac1280-d187-11ea-81c6-14146ec64848.png)

[Monorepo](https://en.wikipedia.org/wiki/Monorepo) for [@platform](https://www.npmjs.com/org/platform) modules.

<p>&nbsp;</p>
<p>&nbsp;</p>



# Philosophy

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


# Development Setup

### Extracting Secrets

When setting a new developer up, to extract all secrets configuration files (eg. `.env` and other `.gitignore`-ed files that are never commited) run [msync](https://github.com/philcockfield/msync) command:


      msync hidden

...this will produce folder that you can easily copy the files with.  Is is not (and must never) be commited into the repo.  Once the temporary folder is assembled, transmit it to the next developer, or your next development (after appropriately editing out any keys that are your own) within some sensibly secure "shared password/secret" transmission channel.


<p>&nbsp;</p>
<p>&nbsp;</p>


# License
It's [MIT](LICENSE) all the way!  

Plus...for a scintillating break down of this open-source classic, treat yourself to **Kyle E. Mitchell's**  
"[The MIT License, line-by-line. 171 words every programmer should understand.](https://writing.kemitchell.com/2016/09/21/MIT-License-Line-by-Line.html)"

<a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fuiharness%2Fplatform?ref=badge_large" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fuiharness%2Fplatform.svg?type=large"/></a>

<p>&nbsp;</p>
<p>&nbsp;</p>



## Be Forewarned
![pre-release](https://img.shields.io/badge/Status-pre--release-orange.svg)  
API's and other strcutures will change (probably radically 🐷) prior to `1.x` release.


<p>&nbsp;</p>
<p>&nbsp;</p>



## TODO (COMING)

[ ] [npm deprecations](https://docs.npmjs.com/cli/v7/commands/npm-deprecate) on archived (obsolete/cleaned out) code modules.