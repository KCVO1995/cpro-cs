/*
 * :file description:
 * :name: /cpro-cs/app/service/customer.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-21 21:05:41
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-03 00:01:22
 */
'use strict';
const Service = require('egg').Service;
const { APIS } = require('../constants/index');

class CustomerService extends Service {
  async afterImportOne(customer, wid) {
    await this.ctx.model.Customer.create({
      yhsd_id: customer.id,
      wid,
    });
    return 'ok';
  }
  async getUnionIdByOPenId(openId) {
    const { ctx } = this;
    const token = await ctx.service.wxToken.get();
    const { data } = await ctx.curl(
      `${APIS.GET_WX_UNION_ID}?access_token=${token}&openid=${openId}&lang=zh_CN`,
      {
        method: 'POST',
        contentType: 'json',
        dataType: 'json',
      }
    );
    return data.unionid;
  }
  async getUserByCustomer(customer) {
    const user = {
      userName: customer.name.substr(0, 20),
      appChannel: 3,
      userKey: 1,
      belongVidName: 'Collegepro',
      belongVid: this.app.config.shopInfo.vid,
    };
    if (customer.reg_type === 'mobile') {
      user.phone = customer.reg_identity;
    }
    if (customer.reg_type === 'social') {
      if (customer.unionid) user.unionId = customer.unionid;
      else {
        const unionId = await this.getUnionIdByOPenId(customer.reg_identity);
        user.unionId = unionId;
      }
      user.appId = 'wx377d010f474c10ad';
    }
    return user;
  }
  async importOne(customer) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    const wid = await ctx.model.Customer.getWidByYhsdId(customer.id);
    if (wid) return Promise.resolve('客户已同步');
    if (customer.reg_type === 'email') return Promise.reject(new Error('客户使用邮箱注册'));
    const user = await this.getUserByCustomer(customer);
    return ctx
      .curl(`${APIS.IMPORT_CUSTOMER}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          importType: 1,
          userList: [ user ],
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(res => {
        const { code, data } = res.data;
        if (
          data.errorList.length > 0 &&
          data.errorList[0].errorMessage === '该客户已存在'
        ) {
          const errorList = data.errorList;
          if (errorList.length > 0 && errorList[0].wid) {
            return this.afterImportOne(customer, errorList[0].wid);
          }
          return Promise.reject(res.data);
        }
        if (code.errcode === '0') {
          const successList = data.successList;
          if (successList.length > 0 && successList[0].wid) {
            return this.afterImportOne(customer, successList[0].wid);
          }
          return Promise.reject(res.data);
        }
        return Promise.reject(res.data);
      });
  }
  async updateOne(customer) {
    const { ctx, app } = this;
    const access_token = await ctx.service.token.get();
    const wid = await ctx.model.Customer.getWidByYhsdId(customer.id);
    if (!wid) {
      return this.importOne(customer);
    }
    const user = await this.getUserByCustomer(customer);
    return ctx
      .curl(`${APIS.UPDATE_CUSTOMER}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          vid: app.config.shopInfo.vid,
          wid,
          ...user,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(
        res => {
          const { code } = res.data;
          if (code.errcode === '0') return 'ok';
          if (code.errcode === '001460020011004') {
            this.importOne(customer);
            return 'ok';
          }
          return Promise.reject(res.data);
        },
        e => {}
      );
  }
}

module.exports = CustomerService;
