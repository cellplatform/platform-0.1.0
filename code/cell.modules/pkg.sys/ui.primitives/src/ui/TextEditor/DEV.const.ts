export const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export const DEFAULT = {
  /**
   * Default
   */
  MARKDOWN: `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
  
- one
- two
- three

1. tahi
2. rua
3. toru

---

Before the \`code\` block:

\`\`\`
code block
\`\`\`

After

> Block quote  \

> For whom the bell tolls.

${LOREM}  

${LOREM}  


  `.substring(1),

  /**
   * Long
   */
  LONG: `
${LOREM}  

---

${LOREM}  

`,

  /**
   * Headerings
   */
  HEADING: `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Paragraph - ${LOREM}
  `,
};
