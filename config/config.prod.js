/*
 * :file description:
 * :name: /cpro-cs/config/config.prod.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-07-03 16:58:14
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-01 23:12:33
 */
/* eslint valid-jsdoc: "off" */

'use strict';
const dotenv = require('dotenv');
dotenv.config();

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = () => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  config.sequelize = {
    database: 'cs_production',
    dialect: 'mysql',
    host: 'localhost',
    password: process.env.DB_PASSWORD_PROD,
    port: 3306,
  };
  config.shopInfo = {
    shopId: process.env.SHOP_ID_PROD,
    vid: process.env.V_ID_PROD,
    goodsTemplateId: 1192643230695,
    deliveryId: 10001295124,
    deliveryNodeShipId: 2907478,
    templateId: 10000985155,
  };

  return {
    ...config,
  };
};
