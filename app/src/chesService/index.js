const config = require('config');
const log = require('npmlog');
const Problem = require('api-problem');

const ClientConnection = require('./clientConnection');

const errorToProblem = (e) => {
  if (e.response) {
    log.error(`Error from CHES: status = ${e.response.status}, data : ${JSON.stringify(e.response.data, null, 2)}`);
    let errors = [];
    if (e.response.status === 422) {
      errors = e.response.data.errors;
    }
    throw new Problem(e.response.status, {detail: e.response.data.detail, errors: errors});
  } else {
    log.error(`Unknown error calling CHES: ${e.message}`);
    throw new Problem(500, 'Unknown CHES Error', {detail: e.message});
  }
};

class Index {
  constructor() {
    const endpoint = config.get('serviceClient.commonServices.ches.endpoint');
    const tokenEndpoint = config.get('serviceClient.commonServices.tokenEndpoint');
    const username = config.get('serviceClient.commonServices.username');
    const password = config.get('serviceClient.commonServices.password');
    log.verbose('ChesService', `Constructed with ${tokenEndpoint}, ${username}, ********, ${endpoint}`);
    if (!tokenEndpoint || !username || !password || !endpoint) {
      log.error('ChesService', 'Invalid configuration.');
      throw new Error('Index is not configured. Check configuration.');
    }
    this.connection = new ClientConnection({ tokenEndpoint, username, password });
    this.axios = this.connection.axios;
    this.endpoint = endpoint;
    this.apiV1 = `${this.endpoint}/v1`;
  }

  async health() {
    try {
      const response = await this.axios.get(
        `${this.apiV1}/health`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (e) {
      errorToProblem(e);
    }
  }

  async statusQuery(params) {
    try {
      const response = await this.axios.get(
        `${this.apiV1}/status`,
        {
          params: params,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (e) {
      errorToProblem(e);
    }
  }

  async cancelMsg(msgId) {
    try {
      const response = await this.axios.delete(
        `${this.apiV1}/cancel/${msgId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (e) {
      errorToProblem(e);
    }
  }

  async cancelQuery(params) {
    try {
      const response = await this.axios.delete(
        `${this.apiV1}/cancel`,
        {
          params: params,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (e) {
      errorToProblem(e);
    }
  }

  async send(email) {
    try {
      const response = await this.axios.post(
        `${this.apiV1}/email`,
        email,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      return response.data;
    } catch (e) {
      errorToProblem(e);
    }
  }


  async merge(data) {
    try {
      const response = await this.axios.post(
        `${this.apiV1}/emailMerge`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      return response.data;
    } catch (e) {
      errorToProblem(e);
    }
  }

  async preview(data) {
    try {
      const response = await this.axios.post(
        `${this.apiV1}/emailMerge/preview`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      return response.data;
    } catch (e) {
      errorToProblem(e);
    }
  }

}
let chesService = new Index();
module.exports = chesService;
