const config = require('config');
const log = require('npmlog');
const Problem = require('api-problem');

const ClientConnection = require('./clientConnection');

const errorToProblem = (e) => {
  if (e.response) {
    log.error(`Error from CDOGS: status = ${e.response.status}, data : ${e.response.data}`);
    // Validation Error
    if (e.response.status === 422) {
      throw new Problem(e.response.status, {
        detail: e.response.data.detail,
        errors: JSON.parse(e.response.data).errors
      });
    }
    // Something else happened but there's a response
    throw new Problem(e.response.status, { detail: e.response.data.toString() });
  } else {
    log.error(`Unknown error calling CDOGS: ${e.message}`);
    throw new Problem(502, 'Unknown CDOGS Error', { detail: e.message });
  }
};

class CdogsService {
  constructor() {
    const endpoint = config.get('serviceClient.commonServices.cdogs.endpoint');
    const tokenEndpoint = config.get('serviceClient.commonServices.tokenEndpoint');
    const username = config.get('serviceClient.commonServices.username');
    const password = config.get('serviceClient.commonServices.password');
    log.verbose('CdogsService', `Constructed with ${tokenEndpoint}, ${username}, ********, ${endpoint}`);
    if (!tokenEndpoint || !username || !password || !endpoint) {
      log.error('CdogsService', 'Invalid configuration.');
      throw new Error('CdogsService is not configured. Check configuration.');
    }
    this.connection = new ClientConnection({ tokenEndpoint, username, password });
    this.axios = this.connection.axios;
    this.endpoint = endpoint;
    this.apiV2 = `${this.endpoint}/v2`;
  }

  async health() {
    try {
      const healthEndpoint = `${this.apiV2}/health`;
      log.debug('health', `GET to ${healthEndpoint}`);

      const { data, status } = await this.axios.get(healthEndpoint, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return { data, status };
    } catch (e) {
      errorToProblem(e);
    }
  }

  async docGen(body) {
    try {
      const renderEndpoint = `${this.apiV2}/template/render`;
      log.debug('docGen', `POST to ${renderEndpoint}`);

      const { data, headers, status } = await this.axios.post(renderEndpoint, body, {
        responseType: 'arraybuffer' // Needed for binaries unless you want pain
      });

      return { data, headers, status };
    } catch (e) {
      errorToProblem(e);
    }
  }
}

let cdogsService = new CdogsService();
module.exports = cdogsService;
