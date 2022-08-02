/*
 * :file description:
 * :name: /cpro-cs/app.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 20:54:32
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-02 14:48:06
 */
'use strict';
// app.js
const dotenv = require('dotenv');
dotenv.config();

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad() {
    // 此时 config 文件已经被读取并合并，但是还并未生效
    // 这是应用层修改配置的最后时机
    // 注意：此函数只支持同步调用
  }

  async didLoad() {
    // 所有的配置已经加载完毕
    // 可以用来加载应用自定义的文件，启动自定义的服务
  }

  async willReady() {
    // 所有的插件都已启动完毕，但是应用整体还未 ready
    // 可以做一些数据初始化等操作，这些操作成功才会启动应用

    // 例如：从数据库加载数据到内存缓存
  }

  async didReady() {
    // 应用已经启动完毕
  }

  async serverDidReady() {
    // http / https server 已启动，开始接受外部请求
    // 此时可以从 app.server 拿到 server 的实例
    const ctx = await this.app.createAnonymousContext();
    await ctx.service.token.get(false);
    await ctx.service.wxToken.get();

    // TODO 友好请求日志
    this.app.httpclient.on('response', result => {
      result.res.status;
      result.ctx; // 是发起这次请求的当前上下文
      result.req; // 对应的 req 对象，即 request 事件里面那个 req

      ctx.logger.info('-----------------------------------------------------------------------------------------------------');
      ctx.logger.info('请求地址: ', result.req.url);
      ctx.logger.info('请求参数: %j', result.req.args.data);
      ctx.logger.info('请求结果: %j', result.res.data);
    });
  }
}

module.exports = AppBootHook;
