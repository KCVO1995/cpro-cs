/*
 * :file description:
 * :name: /cpro-cs/app/constants/index.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-20 21:38:40
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-14 17:37:18
 */

'use strict';
const APIS = {
  GET_TOKEN: 'https://dopen.weimob.com/fuwu/b/oauth2/token',
  IMPORT_CUSTOMER:
    'https://dopen.weimob.com/apigw/weimob_crm/v2.0/customer/import',
  UPDATE_CUSTOMER:
    'https://dopen.weimob.com/apigw/weimob_crm/v2.0/customer/update',
  IMPORT_ORDER:
    'https://dopen.weimob.com/apigw/weimob_shop/v2.0/order/omni/import',
  UPDATE_ORDER:
    'https://dopen.weimob.com/apigw/weimob_shop/v2.0/order/omni/update',
  CANCEL_ORDER: 'https://dopen.weimob.com/apigw/weimob_shop/v2.0/order/cancel',
  IMPORT_PRODUCT:
    'https://dopen.weimob.com/apigw/weimob_shop/v2.0/goods/create',
  UPDATE_PRODUCT:
    'https://dopen.weimob.com/apigw/weimob_shop/v2.0/goods/update',
  DELETE_PRODUCT:
    'https://dopen.weimob.com/apigw/weimob_shop/v2.0/goods/delete',
  UPLOAD_FILE: 'https://dopen.weimob.com/media/1_0/ec/goodsImage/uploadImg',
  IMPORT_BRAND:
    'https://dopen.weimob.com/apigw/weimob_shop/v2.0/goods/brand/insert',
  IMPORT_SPEC:
    'https://dopen.weimob.com/apigw/weimob_shop/v2.0/goods/category/skuspec/insert',
  IMPORT_SPEC_VALUE:
    'https://dopen.weimob.com/apigw/weimob_shop/v2.0/goods/category/skuspec/content/insert',
  IMPORT_CATEGORY:
    'https://dopen.weimob.com/apigw/weimob_shop/v2.0/goods/classify/insert',
};

module.exports = { APIS };
