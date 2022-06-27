/*
 * :file description:
 * :name: /cpro-cs/app/model/category.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 14:59:45
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-27 15:49:00
 */
'use strict';

module.exports = app => {
  const { DATE, INTEGER, BIGINT } = app.Sequelize;

  const Category = app.model.define(
    'categories',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      w_category_id: { type: BIGINT, unique: true },
      yhsd_category_id: { type: BIGINT, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );


  Category.getWidByYhsdId = async function(yhsd_category_id) {
    const c = await this.findOne({
      where: {
        yhsd_category_id,
      },
    });
    if (c && c.dataValues && c.dataValues.w_category_id) {
      return c.dataValues.w_category_id;
    }
    return undefined;
  };

  return Category;

};
