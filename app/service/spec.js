/*
 * :file description:
 * :name: /cpro-cs/app/service/spec.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-26 17:28:28
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-26 17:41:57
 */
/*
 * :file description:
 * :name: /cpro-cs/app/service/product.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-23 20:14:21
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-26 17:28:24
 */
'use strict';
const Service = require('egg').Service;
const { APIS, SHOP_INFO } = require('../constants/index');

class SpecService extends Service {
  async getSpecValueId(specId, specValueName) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    const wSpecValueId = await ctx.model.SpecValue.getWidByYhsdName(specValueName);
    if (wSpecValueId) return wSpecValueId;
    return await ctx
      .curl(`${APIS.IMPORT_SPEC_VALUE}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          basicInfo: {
            vid: SHOP_INFO.VID,
          },
          categoryId: SHOP_INFO.CATEGORY_ID,
          specId,
          specValueName,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(async res => {
        const { code, data } = res.data;
        if (code.errcode === '0') {
          const spec_id = await ctx.model.Spec.getIdByWid(specId);
          ctx.model.Spec.create({
            w_spec_value_id: data.id,
            yhsd_option_value_name: specValueName,
            spec_id,
          });
          return data.id;
        }
        // TODO
        ctx.logger.error('weimob import spec value error %j', res.data);
        return undefined;
      });
  }
  async getSpecId(option) {
    const { id, name } = option;
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    const wSpecId = await ctx.model.Spec.getWidByYhsdId(id);
    if (wSpecId) return wSpecId;
    return await ctx
      .curl(`${APIS.IMPORT_SPEC}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          basicInfo: {
            vid: SHOP_INFO.VID,
          },
          categoryId: SHOP_INFO.CATEGORY_ID,
          specName: name,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(res => {
        const { code, data } = res.data;
        if (code.errcode === '0') {
          ctx.model.Spec.create({
            w_spec_id: data.id,
            yhsd_option_id: id,
            yhsd_option_name: name,
          });
          return data.id;
        }
        ctx.logger.error('weimob import spec error %j', res.data);
        return undefined;
      });
  }
}

module.exports = SpecService;
