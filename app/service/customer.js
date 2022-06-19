'use strict';
// app/service/user.js
const Service = require('egg').Service;

class CustomerService extends Service {
  async afterImportOne(customer, weimobResponse) {
    const {
      data: { successList },
    } = weimobResponse;
    if (successList.length > 0 && successList[0].wid) {
      await this.ctx.model.Customer.create({
        yhsd_id: customer.id,
        wid: successList[0].wid,
      });
    }
  }
  getUserByCustomer(customer) {
    const user = {
      userName: customer.name,
      phone:
        customer.reg_type === 'mobile'
          ? customer.reg_identity
          : customer.notify_phone,
    };
    if (customer.reg_identity === 'social') {
      user.openId = customer.reg_identity;
      user.appId = 'wx377d010f474c10ad';
    }
    return user;
  }
  importOne(customer) {
    const { ctx } = this;
    const { access_token } = ctx.app.profile;
    const user = this.getUserByCustomer(customer);
    return ctx
      .curl(
        `https://dopen.weimob.com/apigw/weimob_crm/v2.0/customer/import?accesstoken=${access_token}`,
        {
          method: 'POST',
          data: {
            importType: 1,
            userList: [ user ],
          },
          contentType: 'json',
          dataType: 'json',
        }
      )
      .then(res => {
        // ctx.logger.info('weimob import customer %j', res.data);
        // const { code } = res;
        // if (code.errcode === '0') {
        //   this.afterImportOne(customer, res);
        //   return 'ok';
        // }
        // return Promise.reject(res);
        this.afterImportOne({ id: 111 }, { data: { successList: [{ wid: '111' }] } });
      }, e => {
        ctx.logger.error('weimob import customer error %j', e);
      });
  }
  async updateOne(customer) {
    const { ctx } = this;
    const { access_token } = ctx.app.profile;
    const c = await ctx.model.Customer.findAll({
      where: {
        yhsd_id: customer.id,
      },
    });
    if (c.length === 0) {
      this.importOne(customer);
      return;
    }
    const wid = c[0].dataValues.wid;
    if (!wid) return Promise.reject(new Error('wid is null'));
    const user = this.getUserByCustomer(customer);
    return ctx
      .curl(
        `https://dopen.weimob.com/apigw/weimob_crm/v2.0/customer/update?accesstoken=${access_token}`,
        {
          method: 'POST',
          data: {
            vid: '', // TODO vid
            wid: c.wid,
            ...user,
          },
          contentType: 'json',
          dataType: 'json',
        }
      )
      .then(
        res => {
          ctx.logger.info('weimob update customer %j', res.data);
          const { code } = res;
          if (code.errcode === '0') return 'ok';
          if (code.errcode === '001460020011004') {
            this.importOne(customer);
            return 'ok';
          }
          return Promise.reject(res);
        },
        e => {
          ctx.logger.error('weimob update customer error %j', e);
        }
      );
  }
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
  }
}

module.exports = CustomerService;
