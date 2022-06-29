/*
 * :file description:
 * :name: /cpro-cs/app/controller/product.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-23 20:13:36
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-29 22:13:09
 */
/*
 * :file description:
 * :name: /cpro-cs/app/controller/customer.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 15:07:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-21 21:34:38
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

class ProductController extends Controller {
  async create() {
    const { ctx } = this;
    // ctx.logger.info('yshd create product %j', ctx.request.body);
    try {
      await ctx.service.product.importOne(ctx.request.body);
      ctx.status = 200;
    } catch (e) {
      ctx.status = 400;
    }
  }
  async update() {
    const { ctx } = this;
    // ctx.logger.info('yshd update product %j', ctx.request.body);
    try {
      await ctx.service.product.updateOne(ctx.request.body);
      ctx.status = 200;
    } catch (e) {
      ctx.status = 400;
    }
  }
  async delete() {
    const { ctx } = this;
    // ctx.logger.info('yshd update product %j', ctx.request.body);
    try {
      await ctx.service.product.deleteOne(ctx.request.body);
      ctx.status = 200;
    } catch (e) {
      ctx.status = 400;
    }
  }
}

module.exports = ProductController;
