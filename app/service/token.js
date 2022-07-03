/*
 * :file description:
 * :name: /cpro-cs/app/service/token.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 19:01:21
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-03 17:08:38
 */
'use strict';
const Service = require('egg').Service;
const { APIS } = require('../constants/index');

class TokenService extends Service {
  async get(cache = true) {
    const { ctx, app } = this;
    const token =
      (await ctx.model.Token.findOne({ where: { shop_id: app.config.shopInfo.shopId } })) || {};
    if (cache && token.access_token) {
      return token.access_token;
    }
    const res = await this.ctx.curl(
      `${APIS.GET_TOKEN}?grant_type=client_credentials&client_id=${app.config.shopInfo.clientId}&client_secret=${app.config.shopInfo.clientSecret}&shop_id=${app.config.shopInfo.shopId}&shop_type=${app.config.shopInfo.shopType}`,
      {
        method: 'POST',
        dataType: 'json',
      }
    );
    console.log('获取 token ------ ', res.data);
    const { data: { expires_in, access_token } } = res;
    ctx.model.Token.destroy({ where: { shop_id: app.config.shopInfo.shopId } });
    await ctx.model.Token.create({ shop_id: app.config.shopInfo.shopId, access_token });
    setTimeout(() => { // 过期自动刷新
      ctx.model.Token.destroy({
        where: { shop_id: app.config.shopInfo.shopId },
      });
    }, expires_in * 1000);
    return access_token;
  }
}

module.exports = TokenService;

