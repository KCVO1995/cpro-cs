/*
 * :file description:
 * :name: /cpro-cs/app/constants/index.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-20 21:38:40
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-26 15:00:25
 */

'use strict';
const APIS = {
  // GET_TOKEN: 'https://openapi.alipay.com/gateway.do',
  IMPORT_CUSTOMER:
    'https://dopen.weimob.com/apigw/weimob_crm/v2.0/customer/import',
  UPDATE_CUSTOMER:
    'https://dopen.weimob.com/apigw/weimob_crm/v2.0/customer/update',
  IMPORT_ORDER:
    'https://dopen.weimob.com/apigw/weimob_shop/v2.0/order/omni/import',
  IMPORT_PRODUCT: 'https://dopen.weimob.com/apigw/weimob_shop/v2.0/goods/create',
  UPLOAD_FILE: 'https://dopen.weimob.com/media/1_0/ec/goodsImage/uploadImg',
  IMPORT_BRAND: 'https://dopen.weimob.com/apigw/weimob_shop/v2.0/goods/brand/insert',
};

const CLIENT_ID = '4FF19749D0F5F4A1294ECC312586C918';
const CLIENT_SECRET = '9D0C75C6DCDB050318D2F8478BDBE45E';
const SHOP_ID = 4020502275894;
const SHOP_TYPE = 'business_operation_system_id';
const VID = 6015252206894;

const SHOP_INFO = {
  CLIENT_ID,
  CLIENT_SECRET,
  SHOP_ID,
  SHOP_TYPE,
  VID,
};

module.exports = { APIS, SHOP_INFO };
