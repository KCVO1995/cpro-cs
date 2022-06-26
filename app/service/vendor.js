/*
 * :file description:
 * :name: /cpro-cs/app/service/vendor.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-26 14:59:00
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-26 16:03:31
 */
'use strict';
const Service = require('egg').Service;
const { APIS, SHOP_INFO } = require('../constants/index');

class VendorService extends Service {
  saveOne(yhsd_brand_id, w_brand_id) {
    const { ctx } = this;
    return ctx.model.Vendor.create({
      yhsd_brand_id,
      w_brand_id,
    });
  }
  async getBrandId(vendor) {
    const { ctx } = this;
    const brandId = await ctx.model.Vendor.getWidByYhsdId(vendor.id);
    if (brandId) return brandId;
    return await this.importOne(vendor);
  }
  async importOne(vendor) {
    const { ctx } = this;
    const { id, name } = vendor;
    const access_token = await ctx.service.token.get();
    return ctx.curl(`${APIS.IMPORT_BRAND}?accesstoken=${access_token}`, {
      method: 'POST',
      data: {
        title: name,
        basicInfo: {
          vid: SHOP_INFO.VID,
        },
      },
      contentType: 'json',
      dataType: 'json',
    }).then(res => {
      const { code, data } = res.data;
      if (code.errcode === '0') {
        this.saveOne(id, data.id);
        return data.id;
      }
      ctx.logger.error('weimob import brand error %j', res.data);
      return undefined;
    });
  }
}

module.exports = VendorService;

