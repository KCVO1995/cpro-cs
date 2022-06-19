/*
 * :file description:
 * :name: /cpro-cs/app/controller/customer.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 15:07:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-19 18:35:51
 */
/*
 * :file description:
 * :name: /cpro-cs/app/controller/customer.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 15:07:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-18 17:31:18
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
    ctx.logger.info('yshd create customer %j', ctx.request.body);
    try {
      await ctx.service.customer.importOne(ctx.request.body);
      ctx.status = 200;
    } catch (e) {
      ctx.status = 400;
    }

  }
  async update() {
    const { ctx } = this;
    console.log(ctx.request.body, 'update customer');
    ctx.logger.info('yshd update customer %j', ctx.request.body);
    try {
      await ctx.service.customer.updateOne(ctx.request.body);
      ctx.status = 200;
    } catch (e) {
      ctx.status = 400;
    }
  }
}

module.exports = CustomerController;
