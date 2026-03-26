// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],

    rules: {
      'react/react-in-jsx-scope': 'off',
    },

    // 标记为根配置（对应原来的 root: true）
    settings: {
      root: true,
    },
  },
]);
