import { t, author, category, COMMONTEXT } from './common';

export const BLOCKS: t.DocDefBlock[] = [
  {
    kind: 'Markdown',
    text: `
Web3 is giving us the opportunity to rewrite how groups of people come together and do 
things in the world. But are we importing a core concept from our existing paradigm 
without realising it?

A concept that if it does find its way into the fabric of Web3 might see us recreating 
our traditional centralising structures - the very structures we are so fervently trying 
to shake off?

# How entity thinking became our dominant model.

400 years ago, the creation of the limited liability company (with the formation of the 
[Dutch and English East India Companies](https://www.jstor.org/stable/24551011)) laid 
down the template for the modern company. 
"Legal personhood, permanent capital, transferable shares, separation of ownership and 
management, and limited liability" defined its status as an entity structurally separate 
from the people involved in it. Over the past 400 years this has become the basic template 
upon which all of our capitalist world has been built.

It can go by many names depending on where you are in the world. But whether it’s called a 
[Limited Company](https://en.wikipedia.org/wiki/Limited_company), an 
[LLC](https://en.wikipedia.org/wiki/Limited_company), 
a [Corporation](https://en.wikipedia.org/wiki/Limited_company) or 
some other variation on the theme, it is all 
essentially the same structure that was laid down in the 1600s. The company has become the
basic building block of modern commerce and almost all of the development of modern society 
has been driven by it.

A company is, at its heart, a way of organising a network of participants in a highly 
coordinated and profitable way. By putting different participants into well-defined 
categories (investors, employees, suppliers, customers etc) the company can create a 
role for each to play that will benefit each and benefit the company. If it works, the 
company wins. And the more scale it can generate by doing this, like building giant 
factories and workforces, the more efficiencies it can create and the more it wins. 
This is the basic formula that is repeated across the globe.

In this system the company is the central entity: we invest **in** the company, we work 
**for** the company, we sell to the company we buy **from** the company. The company is always 
at the centre coordinating **its** network.

Because most of the modern world is built on the back of this model, "entity thinking" is an 
inescapable part of our context. Whether it's a company, a non-profit, social enterprise, 
university or a nation state, we can't help but orient around entities. This is programmed 
deep into us and our systems.

Entity thinking is woven all the way through our legal system. As soon as we try to do anything 
practical, we need a formal entity. Anything to do with money, compliance with regulations, 
transacting with customers-everything requires us to centralise around some sort of structured 
entity to contain our activities.

It’s also deep in our psychology, we feel it viscerally. We've all had that experience when 
our thing becomes a Thing. That feeling when our amorphous collection of intention, ideas 
and people gets instantiated as a company, a non-profit, a DAO... an entity. All of a sudden 
it seems more solid, more real, more possible and more valuable than just the sum of our 
collected thoughts and actions.

The entity becomes our psychological anchor and the lack of an entity to anchor our thinking 
makes us feel untethered and a bit lost.

# DAOs are reproducing entity thinking.

Incredible work is happening in DAO governance amidst an explosion of innovation on how to 
coordinate collective activities. Entity thinking, however, is a continuous influence on DAO 
design and governance and it undermines the potential that has drawn us here.

We constantly talk about the network as being the important thing, but we can’t help backsliding 
into focusing on the DAO as an entity and, as a result, ever more time, energy, cost and risk 
gets tied up in governing the entity.

Entity thinking is bound up in the concepts of assets and their need to be owned by something. 
Orienting DAOs around the concept of treasuries and protocols (as assets) draws us into thinking 
of a DAO as an entity, with assets that need to be protected and managed.

For all our talk of "stewardship" as a deeper concept, we can't help but collapse into focusing 
way too much on who’s in charge of the entity and its assets.

Even as we decentralise DAO decision-making via proposal voting, if we are just decentralising 
the governance of an inherently centralising concept we are repeating this historical pattern 
and missing the bigger Web3 opportunity.

If anything, the success of DAOs has served to exacerbate the tendency towards entity thinking, 
due to the fact that many DAOs have treasuries that are out of all proportion with the current 
value that exists in their networks. This distortion makes it almost impossible for a DAO’s 
treasury (as a centralised asset) not to have an outsized gravitational pull.
`,
  },

  {
    kind: 'Image',
    credit: 'Photo by Martin Sanchez on Unsplash',
    url: 'https://tdb-4wu2h9jfp-tdb.vercel.app/river-flow-resource.png',
    margin: { top: 30, bottom: 30 },
  },

  {
    kind: 'Markdown',
    text: `
# The value exists in the DAO network, not in the DAO entity.

If we can stop collapsing into this subtle trap of entity thinking, we can see decentralised 
autonomous organisations in a much more profound way, as decentralised autonomous networks. 
As centerless networks that organise themselves. As coordinated flows of resources across a 
network towards some animating goal.

We need design that recognises DAO networks as what they are: groups of actors (people and 
organisations) who are coordinating their collective resources towards some shared intent. 
Their value is represented in real-time as the resources in the network (time, skills, 
technology, capital etc) plus the way it is being coordinated toward their goals in 
high leverage ways.

Our fixation on treasury assets and protocols as assets is leading us to miss that the 
incredible potential of Web3 can only be realised when networks are set free.

When they are not squeezed through a centralising entity frame, three critical properties 
become possible for DAO networks:

1. **High-scale**  
 They are capable of generating the kind of high-leverage scale-economies that companies 
have used to power the last 400 years of progress.

2. **Adaptive**  
 They can innovate. They can be adaptive and evolve, form and re-form in unique and powerful 
 ways. Unlike companies, along with leveraging scale they can also be highly creative, experimental and responsive to change.

3. **Sensing**  
 All of this scale and innovation can be driven by a broader and deeper sensing of what is 
 needed beyond the narrow set of needs that a company is designed to serve (i.e., maximising 
 shareholder value). DAO networks can genuinely serve the larger needs of the ecosystems 
 they inhabit.

These three qualities hold the potential of what Web3 can offer the world, but their 
actualisation is by no means guaranteed. If we continue to pass everything through an entity 
thinking filter as our underlying framing, we are more likely to get the heartbreak of more of 
the same… a world where high-leverage, high-scale things are dominated by centralising power 
and profit motives and where the work of moving the world to a better future is back as a 
low-leverage, low-scale side project for humanity.

# Fractal DAO design can take us somewhere better.

If we lean into thinking about DAO networks as coordinated flows of resources towards a goal, 
and not as centralising entities, then the only real way for this to work is using fractal 
dynamics. Just as in biological systems, we need DAO networks that can:

- Spin up versions of themselves out of themselves
- Constantly form, reform and deform
- Exercise radical freedom combined with powerful interdependence

Fractal DAO network design is leading us to ask questions like:

- What is a minimum viable DAO network structure?
- What primitives and tools would make it simple for networks to spin up useful fractals of themselves?
- How can a treasury be a distributed function across a network and not a centralising force?
- How can part of a network reform into a new structure that fully represents the value embodied by that part of the network?
- How can tokens (meta-governance, treasury, reserve currencies) work across fractal networks to maintain powerful but flexible interdependence - governance, incentives and leverage?

There is a lot more to say about fractal design in DAOs and also a bunch of folks doing 
interesting work to answer some of these questions. Some promising examples include:

- [Modular Politics](https://arxiv.org/pdf/2005.13701.pdf)
- [Metagov](https://metagov.org/)
- [Gnosis Guild](https://gnosisguild.mirror.xyz/)
- [Orca Protocol](https://www.orcaprotocol.org/)
  `,
  },

  {
    kind: 'Image',
    url: 'https://tdb-4wu2h9jfp-tdb.vercel.app/net-gravity.png',
    credit: 'Image Credit: BenRG, public domain',
    margin: { bottom: 10, top: 40 },
  },

  {
    kind: 'Markdown',
    text: `    
# “DAO” as a verb, not a thing.

It’s also true that thinking about DAOs as complex networks is probably what we all think we 
are doing already. But entity thinking is deeply ingrained and subtle and will keep exerting 
its gravity on what we are designing and building. We need to be aware, moment by moment, of 
when we might be collapsing back into entity thinking, otherwise its centralising power will 
just keep sneaking back in again and again.

Maybe part of this is a reorientation of our language. Maybe it's "DAO" as a verb. 
The ”organisation” in DAO does not refer to an entity, but to the act of organising.

To DAO, or DAOing, is for a network to autonomously organise itself in a decentralised way. 
And what we call “DAO” is just the collection of coordinating functions that show up in a 
network/community so that it can achieve its goals.

Perhaps this reframing will help keep us oriented towards coordinating value flows across 
networks and away from legacy ideas and entity thinking.
    `,
  },
];
