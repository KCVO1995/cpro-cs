/*
 * :file description:
 * :name: /cpro-cs/app/service/token.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 19:01:21
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-19 20:48:31
 */
'use strict';
const Service = require('egg').Service;

const client_id = '4FF19749D0F5F4A1294ECC312586C918';
const client_secret = '9D0C75C6DCDB050318D2F8478BDBE45E';
const shop_id = '4020505860894';
// const shop_type = 'business_operation_system_id';
const shop_type = '';
class TokenService extends Service {
  async get(cache = true) {
    const { ctx } = this;
    const token = await ctx.model.Token.findOne({ where: { shop_id } }) || {};
    if (cache && token.access_token) {
      return token.access_token;
    }
    const res = await this.ctx.curl(
      `https://dopen.weimob.com/fuwu/b/oauth2/token?grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}&shop_id=${shop_id}&shop_type=${shop_type}`,
      {
        method: 'POST',
        dataType: 'json',
      }
    );
    console.log('获取 token ------ ', res.data);
    const { data: { expires_in, access_token } } = res;
    await ctx.model.Token.create({ shop_id, access_token });
    setTimeout(() => { // 过期自动刷新
      console.log('--------fuck-----------');
      ctx.model.Token.destroy({
        where: { shop_id },
      });
    }, expires_in * 1000);
    return access_token;
  }
}

module.exports = TokenService;

