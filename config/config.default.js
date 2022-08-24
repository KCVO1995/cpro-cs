/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1655536057826_3632';

  // add your middleware config here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.shopInfo = {
    clientId: '4FF19749D0F5F4A1294ECC312586C918',
    clientSecret: '9D0C75C6DCDB050318D2F8478BDBE45E',
    shopType: 'business_operation_system_id',
    categoryId: 43,
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.cors = {
    origin: 'https://www.collegepro.cn',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  return {
    ...config,
    ...userConfig,
  };
};
