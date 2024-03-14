// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const path = require('path');

module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    extraNodeModules: {
      ...config.resolver.extraNodeModules,
      ...require('stream-browserify'),
      ...require('node-libs-react-native'),
      net: require.resolve('node-libs-react-native/mock/net'),
      tls: require.resolve('node-libs-react-native/mock/tls'),
      crypto: require.resolve('expo-crypto')

    },
  },
};
