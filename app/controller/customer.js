/*
 * :file description:
 * :name: /cpro-cs/app/controller/customer.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 15:07:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-30 10:17:57
 */
'use strict';

// TODO 名字没同步
const Controller = require('egg').Controller;

class CustomerController extends Controller {
  async textImport() {
    const { ctx } = this;
    ctx.status = 200;
  }
  async create() {
    const { ctx } = this;
    try {
      await ctx.service.customer.importOne(ctx.request.body);
      ctx.status = 200;
    } catch (e) {
      ctx.status = 400;
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
