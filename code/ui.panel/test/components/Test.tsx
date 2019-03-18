import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import * as React from 'react';

import { Test as StackPanelTest } from '../../src/components/StackPanel/Test';

// import { animation } from '../../src/common';
export const Test = () => {
  return <StackPanelTest style={{ Absolute: 10 }} />;
};

/**
 * Test Component
 */
// export type IState = { count?: number };
// export class Test extends React.PureComponent<{}, IState> {
//   public state: IState = { count: 0 };
//   private stop$ = new Subject();

//   public render() {
//     return (
//       <div style={{ padding: 30 }}>
//         <div style={{ marginBottom: 10 }}>
//           <div>
//             <Button label={'Animate'} onClick={this.handleAnimate} />
//           </div>
//           <div>
//             <Button label={'Reset'} onClick={this.handleReset} />
//           </div>
//         </div>
//         <ObjectView name={'state'} data={this.state} />
//       </div>
//     );
//   }

//   private handleReset = () => {
//     this.setState({ count: 0 });
//   };

//   private handleAnimate = async () => {
//     await this.animate({ count: 50 });
//   };

//   private animate(target: {}) {
//     this.stop$.next(); // Stop currently executing animation (if any).
//     const current = () => this.state;
//     const duration = 500;
//     animation
//       .start({ target, current, duration, type: 'easeInOut' })
//       .pipe(takeUntil(this.stop$))
//       .subscribe({
//         next: data => this.setState(data as any),
//         complete: () => {
//           // Done.
//         },
//       });
//   }
// }
