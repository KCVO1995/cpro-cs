/*
 * :file description:
 * :name: /cpro-cs/config/config.prod.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-07-03 16:58:14
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-09 16:28:00
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

  // TODO
  // config.sequelize = {
  //   database: 'cs_development',
  //   dialect: 'mysql',
  //   host: 'localhost',
  //   password: 'kcvo',
  //   port: 3306,
  // };
  config.shopInfo = {
    shopId: 4020502275894,
    vid: 6015252206894,
  };

  return {
    ...config,
  };
};
