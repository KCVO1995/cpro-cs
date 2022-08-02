/*
 * :file description:
 * :name: /cpro-cs/app/service/wxToken.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-08-02 00:20:22
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-02 14:59:40
 */
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

class WxTokenService extends Service {
  async getToken() {
    const { WX_APP_ID, WX_APP_SECRET } = process.env;
    const res = await this.ctx.curl(
      `${APIS.GET_WX_TOKEN}?grant_type=client_credential&appid=${WX_APP_ID}&secret=${WX_APP_SECRET}`,
      { method: 'GET', dataType: 'json' }
    );
    const {
      data: { access_token },
    } = res;
    return access_token;
  }
  async get() {
    const { ctx } = this;
    const { dataValues: data } = (await ctx.model.WxToken.findOne()) || {};
    if (!data.token || (data && data.token_expires < new Date().getTime())) {
      await ctx.model.WxToken.destroy({ where: {} });
      const token = await this.getToken();
      await ctx.model.WxToken.create({ token });
      return token;
    }
    return data.token;
  }
}

module.exports = WxTokenService;
