// import { React, Actions } from '../../test';
// import { ImageSprite } from '.';

/**
 * Test Actions.
 */
// const actions = Actions.props({})
//   .header('ImageSprite')
//   .add('1,1 (default)', e => e.props({ x: 1, y: 1 }))
//   .add('2,1', e => e.props({ x: 2, y: 1 }))
//   .add('3,1', e => e.props({ x: 3, y: 1 }))
//   .add('4,1', e => e.props({ x: 4, y: 1 }))
//   .add('5,1', e => e.props({ x: 5, y: 1 }))

//   .hr()
//   .add('1,2', e => e.props({ x: 1, y: 2 }))
//   .add('2,2', e => e.props({ x: 2, y: 2 }))
//   .add('3,2', e => e.props({ x: 3, y: 2 }))
//   .add('4,2', e => e.props({ x: 4, y: 2 }))
//   .add('5,2', e => e.props({ x: 5, y: 2 }));

// /**
//  * Test View.
//  */
// export type ITestProps = {};
// export interface ITestState {}
// export class Test extends React.PureComponent<ITestProps, ITestState> {
//   public state: ITestState = {};

//   public render() {
//     return (
//       <Actions items={actions} leftWidth={300} padding={30} rightStyle={{ Flex: 'start-center' }}>
//         <Content />
//       </Actions>
//     );
//   }
// }

// export class Content extends React.PureComponent {
//   public render() {
//     return (
//       <ImageSprite
//         width={20}
//         height={15}
//         src={'/images/ImageSprite.test/sample.png'}
//         total={{ x: 5, y: 4 }}
//         {...this.props}
//       />
//     );
//   }
// }
