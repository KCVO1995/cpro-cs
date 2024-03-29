/*
 * :file description:
 * :name: /cpro-cs/app/controller/order.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 15:07:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-03 22:15:38
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

class OrderController extends Controller {
  async create() {
    const { ctx } = this;

    try {
      const result = await ctx.service.order.importOne(ctx.request.body);
      ctx.status = 200;
      if (result === '订单已存在') ctx.body = { message: result };
    } catch (e) {
      ctx.status = 400;
      ctx.body = { message: e.message };
    }
  }
  async update() {
    const { ctx } = this;

    try {
      await ctx.service.order.updateOne(ctx.request.body);
      ctx.status = 200;
    } catch (e) {
      ctx.status = 400;
    }
  }
}

module.exports = OrderController;
