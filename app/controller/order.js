/*
 * :file description:
 * :name: /cpro-cs/app/controller/order.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 15:07:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-03 16:51:04
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
    console.log(this.app.config, 'xxx');

    try {
      // await ctx.service.order.importOne(ctx.request.body);
      ctx.status = 200;
    } catch (e) {
      ctx.status = 400;
    }
  }
}

module.exports = OrderController;
