/*
 * :file description:
 * :name: /cpro-cs/config/config.prod.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-07-03 16:58:14
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-26 23:52:01
 */
/*
 * :file description:
 * :name: /cpro-cs/config/config.local.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 19:30:08
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-03 16:58:07
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
    database: 'cs_test',
    dialect: 'mysql',
    host: 'localhost',
    password: 'kcvo',
    port: 3306,
  };
  config.shopInfo = {
    shopId: 4020502275894,
    vid: 6015252206894,
    goodsTemplateId: 1192643230695,
    deliveryId: 10001295124,
    deliveryNodeShipId: 2907478,
    templateId: 10000985155,
  };

  return {
    ...config,
  };
};
