/*
 * :file description:
 * :name: /cpro-cs/app/model/image.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-26 16:25:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-26 16:32:21
 */
/*
 * :file description:
 * :name: /cpro-cs/app/model/vendor.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-23 20:07:31
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-26 15:39:29
 */
/*
 * :file description:
 * :name: /cpro-cs/app/model/customer.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 14:59:45
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-22 22:29:27
 */
'use strict';

module.exports = app => {
  const { DATE, INTEGER, STRING } = app.Sequelize;

  const Image = app.model.define(
    'images',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      w_url: { type: STRING },
      yhsd_url: { type: STRING },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  Image.getWUrlByYhsdUrl = async function(yhsd_url) {
    const c = await this.findOne({
      where: {
        yhsd_url,
      },
    });
    if (c && c.dataValues && c.dataValues.w_url) {
      return c.dataValues.w_url;
    }
    return undefined;
  };

  return Image;

};
