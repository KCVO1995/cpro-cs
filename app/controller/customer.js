/*
 * :file description:
 * :name: /cpro-cs/app/controller/customer.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 15:07:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-18 17:47:00
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
}

module.exports = CustomerController;
