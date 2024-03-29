import { t, author, category, COMMONTEXT } from './common';
import { FLOWS } from './SAMPLE.Flows';

export const BLOCKS: t.DocDefBlock[] = [
  {
    kind: 'Markdown',
    markdown: `
As described in “[DAOs aren’t things; They are flows](${FLOWS.path})”, Web3 presents the 
possibility of a new paradigm to replace the company-centric paradigm that has been evolving 
over the past 400 years.
`,
  },

  {
    kind: 'Image',
    url: 'https://tdb-l67ov2q2s-tdb.vercel.app/scale-company-quote.png',
    margin: { top: 20, bottom: 20 },
    ratio: '144:47',
  },

  {
    kind: 'Markdown',
    markdown: `
If we can shed this ‘company as centralising entity’ paradigm and instead see DAOs not as 
entities but as centerless networks with coordinated flows of resources, then a whole new 
way of looking at business and economics becomes possible.

DAOs and companies are fundamentally different systems. Companies operate **business models**. 
DAOs are **network economies**. And this distinction is at the heart of why DAOs have the potential 
to usher in a new paradigm.

Unpacking what network economies are and how they are different and more powerful than business 
models will require some framing. The concept of scale will be our way into understanding this;
and to explain scale, I will lean heavily on Geoffrey West’s work on the dynamics of how systems 
scale.

A fuller explanation can be found [here](https://www.youtube.com/watch?v=nxgHyPCCqaw&t=2s), 
but at a high level there are two fundamental dynamics to understand:
    `,
  },

  {
    kind: 'Image',
    url: 'https://tdb-txfs4hhl5-tdb.vercel.app/scale-dymamics-list.png',
    margin: { top: 10, bottom: 20 },
    ratio: '180:47',
  },

  {
    kind: 'Markdown',
    markdown: `    
I will start by outlining both of these dynamics and, if I do this well, hopefully it will 
become obvious that these two systems are the keys to unlocking the power that DAOs can embody 
in the world.    
  `,
  },

  {
    kind: 'Image',
    url: 'https://tdb-l67ov2q2s-tdb.vercel.app/scale-div-d1.png',
    margin: { top: 80, bottom: 0 },
    ratio: '720:197',
  },

  {
    kind: 'Markdown',
    markdown: `
West’s work starts with understanding that biological systems scale in a **sub-linear** way, 
meaning that as biological systems (mammals, insects, trees, etc) increase in size they 
become more efficient in a uniform and predictable way. For example, if you double the 
size of a mouse, it will only require 75% more food, oxygen, water and so forth; its heart 
will beat slower, and it will live longer. And the equations that predict this are accurate 
all the way up from a mouse to an elephant or a blue whale; each doubling in size produces 
a corresponding 25% increase in efficiency. The mechanisms that cause this phenomena have 
to do with the concept called **fractal scaling hierarchies.**

Biological systems create fractal hierarchies with branching structures and every layer in 
the hierarchy creates an increase in efficiency. A good example is the cardiovascular system 
of a mammal. All of us mammals have a heart that pumps blood around our bodies in the same way; 
the heart pumps blood under pressure into an aorta which branches into two arteries. These then 
branch into more arteries and these then branch into still more. The physics that govern this 
system means that the more layers in the branching hierarchy, the more efficient the system 
becomes (the amount of work your heart has to do to get oxygenated blood to every cell in your 
body drops as you grow). This is why a 220 ton blue whale’s heart only has to beat 11 times 
per minute to circulate blood to every cell in its body, while a mouse’s heart needs to beat 
500 times a minute to do the same thing. And every mammal in between these two exhibits the 
exact same heart rate to size ratio.

Amazing as this is, what is more incredible is that this dynamic holds true for human-built 
systems too. This scaling effect is the fundamental dynamic that makes companies work. 
As a business grows, it is essentially building a set of branching hierarchies that generate 
economies of scale using the [same mathematics](https://arxiv.org/abs/2109.10379) that mammals, 
insects and trees use to grow. 
As the company increases its size and adds more layers to its hierarchy, efficiencies are 
gained across all the layers in the hierarchy. This causes the unit cost of the goods it 
produces to fall as its size increases. This is known as **sub-linear scaling**, where the use 
of resources becomes more and more efficient as the system grows in size.

# Fractal hierarchies are finite.

Systems that rely on scaling via fractal hierarchies can become incredibly efficient as they 
scale. But the downside of this dynamic is that these systems decay and die in very predictable 
ways. The lifespans of all animals are almost perfectly predicted by their size (for mammals, 
from a mouse 1-1.5 years, to an elephant 60-70 years, to a blue whale 80-90 years). The bigger 
you are, the longer you live – but all do die eventually.

This is because fractal hierarchies are rigid. They gain advantage by creating infrastructures 
that can deliver scale, but over time this infrastructure decays. Over time the system inevitably 
pours more and more of its resources into maintaining its aging infrastructure and, with no 
ability to alter its fixed structure, it eventually becomes non-viable.

*As a side note, humans are the only animals that buck this trend by living roughly twice as long 
as we should based on our size. But this has only happened in the past few hundred years because 
of breakthroughs in medicine, hygiene, nutrition etc. Up until the 19th century our lifespan 
averaged somewhere between 20-40 years, which is about right for our body size.*

# Companies are masters of fractal hierarchies

This dynamic is what underpins 400 years of success for the “Company”. With the creation of the 
limited liability company we gained a highly effective system to make this dynamic work – 
allocating capital, to build infrastructure, to scale a business model… rinse and repeat.

But a consequence of this is that, like fractal hierarchies in biology, companies are finite. 
They scale their business models but then over time they fail to evolve, their infrastructure 
requires more and more resources to maintain itself, and eventually they die.

This death is often not obvious. Companies employ every trick they can to keep themselves alive, 
including anti-competitive practices, buying and incorporating other companies that are still on 
a scaling upswing, or they themselves might be acquired by another company (continuing a brand 
even though the company essentially disappears). But even with all of these strategies to 
cheat death, a broad analysis shows that almost all companies do predictably decline and die.
  `,
  },

  {
    kind: 'Image',
    url: 'https://tdb-l67ov2q2s-tdb.vercel.app/scale-div-d2.png',
    margin: { top: 80, bottom: 0 },
    ratio: '720:197',
  },

  {
    kind: 'Markdown',
    markdown: `
The other powerful dynamic that West identifies is that of **social networks** and the way they 
produce social outputs in a **super-linear** way. The social networks we are referring to here 
are simply networks of humans interacting; this might be friend groups, business relationships, 
religious communities, membership clubs etc – any collection of social relationships.

Social networks scale in a super-linear way based on a set of predictable networks dynamics, 
including [Metcalfe’s law](https://en.wikipedia.org/wiki/Metcalfe%27s_law)
`,
  },

  {
    kind: 'Image',
    url: 'https://tdb-txfs4hhl5-tdb.vercel.app/scale-metcalfs-law.png',
    margin: { top: 50, bottom: 50 },
    ratio: '120:29',
  },

  {
    kind: 'Markdown',
    markdown: `
This is how things like markets work. The greater the number of participants in a market
network, the greater the possibility that valuable exchanges of goods and services will occur 
(trade as a social output) and therefore the greater the value of the network.

This means that as social networks increase in size they produce social outputs at an increasing 
rate. So if you double the size of a social network, the research shows that you get a greater 
than double increase in social outputs; a 115% increase, to be exact.

This dynamic holds true across all social outputs, but what we are interested in for this
analysis is the production of ideas and innovation. And the conclusion of West and his team 
is clear; if you increase the size of a social network, you get a mathematically predictable 
super-linear increase in ideas and innovation. This is a direct result of the greater surface 
area for the exchange of ideas, knowledge, capital and the possibility for creative 
collaboration.

The problem for companies is that once they are mature, it is nearly impossible for them to 
successfully leverage this social network driven dynamic. The necessity for them to commit to 
building scaling hierarchies in order to capture the benefits of economies of scale means that 
they need to have highly rigid infrastructure and organisational structures. This makes genuine 
creative innovation almost impossible. Try as they might, innovation is just not what they are 
designed for.

Some do engage in R&D to drive product line expansion etc, but this seldom leads to genuinely 
novel innovation. So most resign themselves to purchasing innovation that is produced by others. 
As their hierarchies become more and more entrenched and inflexible, they do this more and more 
in an effort to stay relevant and ultimately to try to ward off their inevitable decline.

# But cities don’t die

This is where West’s analysis gets really interesting. While animals, plants and companies 
all predictably die, throughout history there have been almost no cases of cities dying.

It turns out that cities survive (and thrive) because they are able to harness both of these 
dynamics - sub-linear hierarchical scaling **AND** super-linear social network driven creativity 
and innovation.

Cities utilise scaling infrastructure for roading, electrical grids, water supply, hospitals, 
emergency services, communication networks, schools, and much more. This means that the bigger 
the city, the more efficient all of this infrastructure becomes, which allows for more amenities 
and better standards of living.

But, as cities grow, they also have ever larger social networks, which produce increasing 
amounts of creativity and innovation (along with all the other social outputs). If you double 
the size of a city it produces 115% more research papers, patents, startups etc.

This dynamic has the effect of creating a virtuous cycle of innovation and improvement to the 
city. The innovation producing function of the city creates a constant stream of innovative new 
businesses growing to replace those that die, bringing in new money; incomes go up, 
infrastructure is invested in and improved, the city is renewed. This in turn adds another 
virtuous cycle where the improvement in the lifestyles and prospects of the city’s residents 
attracts new residents, which then improves the **Dynamic One** efficiency of the infrastructure 
and also improves the **Dynamic Two** ideas and innovation machine.

# What about DAOs?
You can probably see where this is going. DAOs as network economies have the potential to 
leverage both **Dynamic One** and **Dynamic Two.** After all, cities are not things either… They are 
networks!

Companies are fundamentally about building out fractal scaling infrastructure. That is what they 
do. Steve Blank, professor of entrepreneurship at Stanford and Berkeley Universities, 
differentiates between a startup and a business (company) in the following way:
`,
  },

  {
    kind: 'Image',
    url: 'https://tdb-l67ov2q2s-tdb.vercel.app/scale-blank.png',
    margin: { top: 30, bottom: 30 },
    ratio: '16:5',
  },

  {
    kind: 'Markdown',
    markdown: `
In this framing, we can see that a startup is meant to operate like a social network – a group 
of founders, who are hopefully well connected, being highly creative and innovative as they 
connect, experiment, iterate, pivot... in the hope that they can discover a repeatable and 
scalable business model.

Then when they have the repeatable and scalable business model, they become laser-focused on 
building the infrastructure to scale the business model. This commits them to the structure 
they have chosen. They orient their strategy and their business units towards delivering this 
structure and change, after this point, is extremely difficult.

But DAOs are network economies, not business models. And as network economies they can be more 
like cities and can escape the rigid and finite fate of companies. As economies, they can 
leverage both dynamics; they can be engines of experimentation and discovery, led by communities 
of individuals aligned around a shared purpose, but they can also bring these innovations to 
scale making them useful to the world.
  `,
  },

  {
    kind: 'Image',
    url: 'https://tdb-l67ov2q2s-tdb.vercel.app/scale-diagram.png',
    margin: { top: 30, bottom: 30 },
    ratio: '36:47',
  },

  {
    kind: 'Markdown',
    markdown: `
This is possible because network economies can be coordinated in much more complex and useful 
ways than can companies. A DAO network can contain multitudes. Rather than being a single 
centralising, controlling entity, it can contain many autonomous self-organising groups – 
all working towards its overarching purpose inside a vastly more flexible structure; some 
building scaling hierarchies and others exploring and creating.

Like cities, leveraging **Dynamics One** and **Two**, DAO networks can benefit from the same positive 
feedback loops as they grow. Increasing economies of scale make them powerful, while constant 
creativity, innovation and responsiveness keep them alive and relevant to a changing world. 
And as a result of this they attract more and more talented people looking for opportunities 
to do useful things, who grow and sustain the DAO network.

This is the promise of Web3! This is the promise of DAOs as networks of inspired individuals 
that can collectively overcome the inertia of our deeply entrenched economic system, multi 
trillion dollar incumbents and 400 years of habit.

And to do this DAOs have to be able to leverage **both** Dynamic-One **and** Dynamic-Two.    
  `,
  },

  {
    kind: 'Image',
    url: 'https://tdb-l67ov2q2s-tdb.vercel.app/scale-end.png',
    margin: { top: 0, bottom: 0 },
    ratio: '240:83',
  },
];
