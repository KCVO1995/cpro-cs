/*
 * :file description:
 * :name: /cpro-cs/app/service/spec.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-26 17:28:28
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-03 17:04:15
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
const { APIS } = require('../constants/index');

class SpecService extends Service {
  async getSpecValueId(specId, specValueName) {
    const { ctx, app } = this;
    const wSpecValueId = await ctx.model.SpecValue.getWidByYhsdName(specValueName);
    if (wSpecValueId) return wSpecValueId;
    const access_token = await ctx.service.token.get();
    return ctx
      .curl(`${APIS.IMPORT_SPEC_VALUE}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          basicInfo: {
            vid: app.config.shopInfo.vid,
          },
          categoryId: app.config.shopInfo.categoryId,
          specId,
          specValueName,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(res => {
        const { code, data } = res.data;
        if (code.errcode === '0') {
          return ctx.model.Spec.getIdByWid(specId).then(id => ({ data, id }));
        }
        return undefined;
      })
      .then(({ data, id: spec_id }) => {
        return ctx.model.SpecValue.create({
          w_spec_value_id: data.id,
          yhsd_option_value_name: specValueName,
          spec_id,
        }).then(() => data.id);
      })
      .then(id => id);
  }
  async getSpecId(option) {
    const { id, name } = option;
    const { ctx, app } = this;
    const wSpecId = await ctx.model.Spec.getWidByYhsdId(id);
    if (wSpecId) return wSpecId;
    const access_token = await ctx.service.token.get();
    return ctx
      .curl(`${APIS.IMPORT_SPEC}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          basicInfo: {
            vid: app.config.shopInfo.vid,
          },
          categoryId: app.config.shopInfo.categoryId,
          specName: name,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(res => {
        const { code, data } = res.data;
        if (code.errcode === '0') {
          return ctx.model.Spec.create({
            w_spec_id: data.id,
            yhsd_option_id: id,
            yhsd_option_name: name,
          }).then(() => data);
        }
        return undefined;
      }).then(data => data.id);
  }
}

module.exports = SpecService;
