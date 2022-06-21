export const Util = {
  isMock(input: any) {
    return typeof input === 'object' && input !== null && input.kind === 'LocationMock';
  },
};
