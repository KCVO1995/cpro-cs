/*
 * :file description:
 * :name: /cpro-cs/app/service/token.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 19:01:21
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-23 17:44:00
 */
'use strict';
const Service = require('egg').Service;
const { SHOP_INFO } = require('../constants/index');

class TokenService extends Service {
  async get(cache = true) {
    const { ctx } = this;
    const token =
      (await ctx.model.Token.findOne({ where: { shop_id: SHOP_INFO.SHOP_ID } })) || {};
    if (cache && token.access_token) {
      return token.access_token;
    }
    const res = await this.ctx.curl(
      `https://dopen.weimob.com/fuwu/b/oauth2/token?grant_type=client_credentials&client_id=${SHOP_INFO.CLIENT_ID}&client_secret=${SHOP_INFO.CLIENT_SECRET}&shop_id=${SHOP_INFO.SHOP_ID}&shop_type=${SHOP_INFO.SHOP_TYPE}`,
      {
        method: 'POST',
        dataType: 'json',
      }
    );
    console.log('获取 token ------ ', res.data);
    const { data: { expires_in, access_token } } = res;
    ctx.model.Token.destroy({ where: { shop_id: SHOP_INFO.SHOP_ID } });
    await ctx.model.Token.create({ shop_id: SHOP_INFO.SHOP_ID, access_token });
    setTimeout(() => { // 过期自动刷新
      ctx.model.Token.destroy({
        where: { shop_id: SHOP_INFO.SHOP_ID },
      });
    }, expires_in * 1000);
    return access_token;
  }
}

module.exports = TokenService;

