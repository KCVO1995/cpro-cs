'use strict';

const Controller = require('egg').Controller;

class YhsdApiController extends Controller {
  async api() {
    const { ctx } = this;
    console.log(ctx.request);
    // const query = ctx.request.query;
    const body = ctx.request.body;
    console.log(body, 'bbb');
    const url = ctx.request.url.replace('/yhsd/api', '');
    const method = ctx.request.method.toLowerCase();
    console.log(ctx.request);
    try {
      const result = await ctx.helper.openApi[method](url, body);
      ctx.body = result;
    } catch (e) {
      ctx.status = 400;
    }
  }
}

module.exports = YhsdApiController;
