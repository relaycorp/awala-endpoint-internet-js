import baseConfig from '@relaycorp/shared-config/jest.mjs';
export default {
  ...baseConfig,
  setupFilesAfterEnv: ['jest-extended/all'],
};
