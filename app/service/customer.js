/*
 * :file description:
 * :name: /cpro-cs/app/service/customer.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-21 21:05:41
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-28 16:05:16
 */
'use strict';
const Service = require('egg').Service;
const { APIS, SHOP_INFO } = require('../constants/index');

class CustomerService extends Service {
  async afterImportOne(customer, wid) {
    await this.ctx.model.Customer.create({
      yhsd_id: customer.id,
      wid,
    });
  }
  getUserByCustomer(customer) {
    const user = {
      userName: customer.name,
      appChannel: 3,
      userKey: 1,
      belongVidName: 'Collegepro',
      belongVid: SHOP_INFO.VID,
    };
    if (customer.reg_type === 'mobile') {
      user.phone = customer.reg_identity;
    }
    if (customer.reg_type === 'social') {
      user.openId = customer.reg_identity;
      user.appId = 'wx377d010f474c10ad';
    }
    return user;
  }
  async importOne(customer) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    const user = this.getUserByCustomer(customer);
    ctx.logger.info('request customer %j', user);
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
      .then(
        res => {
          ctx.logger.info('weimob import customer %j', res.data);
          const { code, data } = res.data;
          if (
            data.errorList.length > 0 &&
            data.errorList[0].errorMessage === '该客户已存在'
          ) {
            const errorList = data.errorList;
            if (errorList.length > 0 && errorList[0].wid) {
              this.afterImportOne(customer, errorList[0].wid);
              return 'ok';
            }
            return Promise.reject(res.data);
          }
          if (code.errcode === '0') {
            const successList = data.successList;
            if (successList.length > 0 && successList[0].wid) {
              this.afterImportOne(customer, successList[0].wid);
              return 'ok';
            }
            return Promise.reject(res.data);
          }
          return Promise.reject(res.data);
        },
        e => {
          ctx.logger.error('weimob import customer error %j', e);
        }
      );
  }
  async updateOne(customer) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    const wid = await ctx.model.Customer.getWidByYhsdId(customer.id);
    if (!wid) {
      return this.importOne(customer);
    }
    const user = await this.getUserByCustomer(customer);
    ctx.logger.info('request customer %j', user);
    return ctx
      .curl(`${APIS.UPDATE_CUSTOMER}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          vid: SHOP_INFO.VID,
          wid,
          ...user,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(
        res => {
          ctx.logger.info('weimob update customer %j', res.data);
          const { code } = res.data;
          if (code.errcode === '0') return 'ok';
          if (code.errcode === '001460020011004') {
            this.importOne(customer);
            return 'ok';
          }
          return Promise.reject(res.data);
        },
        e => {
          ctx.logger.error('weimob update customer error %j', e);
        }
      );
  }
}

module.exports = CustomerService;
