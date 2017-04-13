/* global Storj */
/* eslint no-undef: ["error", { "typeof": false }] */

import axios from 'axios';
import config from '../../config';
import { fromLocalStorage } from '@/utils';
import uuid from 'uuid/v4';
import qs from 'qs';

/**
 * Authenticates requests sent to Billing. Only keypair authentication
 * is currently allowed
 * @params {Object} options - Options parameter passed to request
 * @params {String} options.method - HTTP method ('GET', 'POST', 'PUT')
 * @params {String} options.path - Path for HTTP request
 * @params {Object} options.params - for 'GET' requests
 * @params {Object} options.json - for 'POST' and 'PUT' requests
 *
 * Example usage:
 *  billingClient.request({
 *    method: 'GET',
 *    path: '/credits/dateRange',
 *    params: { startDate: '', endDate: '' }
 *  })
 *
 *  billingClient.request({
 *    method: 'POST',
 *    path: '/credits/create',
 *    json: { user: '', type: '' }
 *  })
 *
 * Reference: https://github.com/Storj/bridge/blob/master/doc/auth.md
 */
class BillingClient {
  constructor () {
  }

  request(options) {
    const implementedMethods = ['GET', 'PUT', 'POST'];

    return new Promise((resolve, reject) => {
      const privateKey = fromLocalStorage('privateKey');

      if (!privateKey) {
        return reject(new errors.BadRequestError('Private key required'));
      }

      if (implementedMethods.indexOf(options.method) === -1) {
        return reject(new errors.NotImplementedError('Method not implemented'));
      }

      const isGet = ['GET'].indexOf(options.method) !== -1 ? true : false;
      // Create Storj instance to get access to generate keys and sign message
      const storj = new Storj({
        bridge: config.app.BRIDGE_URL,
        key: privateKey
      });
      const keypair = storj.generateKeyPair(privateKey);
      const publicKey = storj.getPublicKey();

      // Nonce for signing
      const nonce = uuid();

      // Add nonce to either params or json depending on type of request
      if (isGet) {
        options.params.__nonce = nonce;
      } else {
        options.json.__nonce = nonce;
      }

      // Stringify according to type of request
      const payload = isGet
        ? qs.stringify(options.params)
        : JSON.stringify(options.json);

      // Create contract string in format of <METHOD>\<PATH>\n<PARAMS>
      const contract = [options.method, options.path, payload].join('\n');

      // Sign contract with keypair
      const signedContract = keypair.sign(contract);

      // Make request to Billing
      const dataType = isGet ? 'params' : 'data';

      return axios({
        method: options.method.toLowerCase(),
        url: config.app.BILLING_URL + options.path,
        [dataType]: isGet ? options.params : options.json,
        headers: {
          'x-pubkey': publicKey,
          'x-signature': signedContract
        }
      })
      .then((result) => resolve(result))
      .catch((err) =< reject(err));
    });
  }
}
