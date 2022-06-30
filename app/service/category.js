/*
 * :file description:
 * :name: /cpro-cs/app/service/category.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-27 15:44:13
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-30 10:19:32
 */
'use strict';
const Service = require('egg').Service;
const async = require('async');
const { APIS, SHOP_INFO } = require('../constants/index');

class CategoryService extends Service {
  saveOne(yhsd_category_id, w_category_id) {
    const { ctx } = this;
    return ctx.model.Category.create({
      w_category_id,
      yhsd_category_id,
    });
  }
  async getCategoryIds(types) {
    const { ctx } = this;
    const ids = await async.map(types, (type, cb) => {
      ctx.model.Category.getWidByYhsdId(type.id).then(wid => {
        console.log(wid, '-------wid-------');
        if (wid) cb(null, wid);
        else {
          this.importOne(type).then(_wid => cb(null, _wid));
        }
      });
    });
    return ids;
  }
  async importOne(type) {
    const { ctx } = this;
    const { id, name } = type;
    const access_token = await ctx.service.token.get();
    return ctx
      .curl(`${APIS.IMPORT_CATEGORY}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          name: name.substr(0, 20),
          basicInfo: {
            vid: SHOP_INFO.VID,
          },
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(res => {
        const { code, data } = res.data;
        if (code.errcode === '0') {
          this.saveOne(id, data.id);
          return data.id;
        }
        return undefined;
      });
  }
}

module.exports = CategoryService;

