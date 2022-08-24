/*
 * :file description:
 * :name: /cpro-cs/app/extend/helper.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-07-02 19:13:49
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-06 09:48:35
 */
'use strict';
const Yhsd = require('yhsd-api');

const _auth = new Yhsd.Auth({
  appKey: '97021a83ad264f159f1650ab82f9fc47',
  appSecret: '015b79b45de6467a8ec7be036eafb72c',
  private: true,
});

let yhsdApi;
const authPromise = _auth.getToken();

const request = (methods, { params }) => {
  if (yhsdApi) return yhsdApi[methods](...params);

  return authPromise.then(token => {
    yhsdApi = new Yhsd.Api(token);
    return yhsdApi[methods](...params);
  });

};

const openApi = new Proxy(
  {},
  {
    get: (target, key) => {
      return (...params) => {
        return request(key, { params });
      };
    },
  }
);


module.exports = {
  openApi,
  getYhsdProduct(productId) {
    return openApi.get(`/products/${productId}`).then(res => {
      return res.product;
    });
  },
  getYhsdOrder(orderId) {
    return openApi.get(`/orders/${orderId}`).then(res => {
      return res.order;
    });
  },
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  getTime(date) {
    return new Date(date || '2000-01-01').getTime();
  },
  async updateOrCreate(model, where, newItem) {
    // First try to find the record
    const foundItem = await model.findOne({ where });
    if (!foundItem) {
      // Item not found, create a new one
      const item = await model.create(newItem);
      return { item, created: true };
    }
    // Found an item, update it
    const item = await model.update(newItem, { where });
    return { item, created: false };
  },
};
