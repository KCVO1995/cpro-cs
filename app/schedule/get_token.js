// eslint-disable-next-line strict
const Subscription = require('egg').Subscription;

class GetToken extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      immediate: true,
      interval: '7000s', // TODO 动态时间
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const res = await this.ctx.curl(
      'https://dopen.weimob.com/fuwu/b/oauth2/token?grant_type=client_credentials&client_id=4FF19749D0F5F4A1294ECC312586C918&client_secret=9D0C75C6DCDB050318D2F8478BDBE45E&shop_id=4020505860894&shop_type=business_operation_system_id',
      {
        method: 'POST',
        dataType: 'json',
      }
    );
    this.ctx.app.profile = res.data;
    console.log(this.ctx.app.profile, 'token');
  }
}

module.exports = GetToken;
