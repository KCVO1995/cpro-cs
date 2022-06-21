/*
 * :file description:
 * :name: /cpro-cs/app/constants/index.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-20 21:38:40
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-20 22:32:33
 */

'use strict';
const APIS = {
  // GET_TOKEN: 'https://openapi.alipay.com/gateway.do',
  IMPORT_CUSTOMER: 'https://dopen.weimob.com/apigw/weimob_crm/v2.0/customer/import',
  UPDATE_CUSTOMER:
    'https://dopen.weimob.com/apigw/weimob_crm/v2.0/customer/update',
  IMPORT_ORDER: 'https://dopen.weimob.com/apigw/weimob_shop/v2.0/order/omni/import',
};

const BOS_ID = '4020504537894';

module.exports = { APIS };
