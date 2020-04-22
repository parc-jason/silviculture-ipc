const axios = require('axios');
const log = require('npmlog');
const oauth = require('axios-oauth-client');
const tokenProvider = require('axios-token-interceptor');

class ClientConnection {
  constructor({ tokenEndpoint, username, password }) {
    log.verbose('ClientConnection', `Constructed with ${tokenEndpoint}, ${username}, ********`);
    if (!tokenEndpoint || !username || !password) {
      log.error('ClientConnection', 'Invalid configuration.');
      throw new Error('ClientConnection is not configured. Check configuration.');
    }

    this.tokenEndpoint = tokenEndpoint;

    this.axios = axios.create();
    this.axios.interceptors.request.use(
      // Wraps axios-token-interceptor with oauth-specific configuration,
      // fetches the token using the desired claim method, and caches
      // until the token expires
      oauth.interceptor(tokenProvider, oauth.client(axios.create(), {
        url: this.tokenEndpoint,
        grant_type: 'client_credentials',
        client_id: username,
        client_secret: password,
        scope: ''
      }))
    );
  }
}

module.exports = ClientConnection;
