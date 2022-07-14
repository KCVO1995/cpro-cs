/*
 * :file description:
 * :name: /cpro-cs/config/config.local.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 19:30:08
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-14 16:19:42
 */
/* eslint valid-jsdoc: "off" */

'use strict';

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
    database: 'cs_development',
    dialect: 'mysql',
    host: 'localhost',
    password: 'kcvo',
    port: 3306,
  };
  config.shopInfo = {
    shopId: 4020504537894,
    vid: 6015253092894,
    goodsTemplateId: 1192643230635,
    deliveryId: 10001146374,
    deliveryNodeShipId: 2801792,
    templateId: 10000889303,
  };

  return {
    ...config,
  };
};
