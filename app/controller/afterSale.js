/*
 * :file description:
 * :name: /cpro-cs/app/controller/afterSale.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-07-16 17:24:08
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-16 23:33:19
 */
'use strict';

const Controller = require('egg').Controller;

class AfterSaleController extends Controller {
  async create() {
    const { ctx } = this;

    try {
      await ctx.service.afterSale.importOne(ctx.request.body);
      ctx.status = 200;
    } catch (e) {
      ctx.status = 400;
    }
  }
  // async update() {
  //   const { ctx } = this;

  //   try {
  //     await ctx.service.order.updateOne(ctx.request.body);
  //     ctx.status = 200;
  //   } catch (e) {
  //     ctx.status = 400;
  //   }
  // }
}

module.exports = AfterSaleController;
