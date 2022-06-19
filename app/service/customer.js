'use strict';
// app/service/user.js
const Service = require('egg').Service;

class CustomerService extends Service {
  async importOneTest() {
    const { ctx } = this;
    const { access_token } = ctx.app.profile;
    const res = await ctx.curl(
      `https://dopen.weimob.com/apigw/weimob_crm/v2.0/customer/import?accesstoken=${access_token}`,
      {
        method: 'POST',
        data: {
          importType: 1,
          userList: [
            {
              phone: '17344429467',
              appChannel: 0,
              userName: 'Jacky',
            },
          ],
          extMap: {
            height: '180cm',
          },
        },
        contentType: 'json',
        dataType: 'json',
      }
    );
    const customer = await ctx.model.Customer.create({ yhsd_id: 123222, wid: 111111 });
    console.log(customer);
    console.log(res.data);
  }
}

module.exports = CustomerService;
