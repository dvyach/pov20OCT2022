/**
 * For cubecloud
 */
const serverConfig = require('./config');

// Cube.js configuration options: https://cube.dev/docs/config
const schemaId = 7;

module.exports = {
  queryRewrite: serverConfig.queryRewrite,
  schemaVersion: ({ authInfo }) => `${schemaId}`,
  scheduledRefreshContexts: serverConfig.scheduledRefreshContexts,
};
