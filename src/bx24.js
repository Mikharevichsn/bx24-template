import { BX24 } from 'bx24';
import { getQueryString } from './utils';
const bx24 = new BX24(window, parent);
window.bx24 = bx24;

export default new (class BX24API {
  constructor() {
    this.auth();
    const urlParams = new URLSearchParams(window.location.search);
    this.baseUrl = `https://${urlParams.get('DOMAIN')}`;
  }

  async auth() {
    if (this.session?.ACCESS_TOKEN) return this.session;
    this.session = await bx24.getAuth();
    return this.session;
  }

  async callMethod(name, params = {}) {
    await this.auth();
    params.auth = this.session.ACCESS_TOKEN;

    const queryString = getQueryString(params);

    const result = await fetch(this.baseUrl + `/rest/${name}?`, {
      method: 'POST',
      body: queryString,
    });

    return await result.json();
  }

  async getAll(name, params = {}) {
    const response = await this.callMethod(name, params);

    if (response.result.length < response.next) {
      return response;
    }

    for (let i = 1; i < Math.ceil(response.total / response.next); i++) {
      params.start = i * response.next;
      const tmpResponse = await this.callMethod(name, params);
      response.result = [...response.result, ...tmpResponse.result];
    }
    return response;
  }
})();
