import baseConfig from '@relaycorp/shared-config/libs/jest.mjs';
export default {
  ...baseConfig,
  setupFilesAfterEnv: ['jest-extended/all'],
};
