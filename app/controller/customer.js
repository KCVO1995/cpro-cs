/*
 * :file description:
 * :name: /cpro-cs/app/controller/customer.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 15:07:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-02 22:35:47
 */
'use strict';

const Controller = require('egg').Controller;

class CustomerController extends Controller {
  async textImport() {
    const { ctx } = this;
    ctx.status = 200;
  }
  async create() {
    const { ctx } = this;
    try {
      const result = await ctx.service.customer.importOne(ctx.request.body);
      ctx.status = 200;
      if (result === '客户已同步') ctx.body = { message: result };
    } catch (e) {
      ctx.status = 400;
      ctx.body = { message: e.message };
    }
  }
  async update() {
    const { ctx } = this;
    try {
      await ctx.service.customer.updateOne(ctx.request.body);
      ctx.status = 200;
    } catch (e) {
      ctx.status = 400;
    }
  }
}

module.exports = CustomerController;
