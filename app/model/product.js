/*
 * :file description:
 * :name: /cpro-cs/app/model/product.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 14:59:45
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-02 19:18:48
 */
'use strict';

module.exports = app => {
  const { DATE, INTEGER, BIGINT } = app.Sequelize;

  const Product = app.model.define(
    'products',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      w_product_id: { type: BIGINT, unique: true },
      yhsd_product_id: { type: BIGINT, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  Product.getWidByYhsdId = async function(yhsd_product_id) {
    const c = await this.findOne({
      where: {
        yhsd_product_id,
      },
    });
    if (c && c.dataValues && c.dataValues.w_product_id) {
      return c.dataValues.w_product_id;
    }
    return undefined;
  };

  Product.getIdByYhsdId = async function(yhsd_product_id) {
    const c = await this.findOne({
      where: {
        yhsd_product_id,
      },
    });
    if (c && c.dataValues && c.dataValues.id) {
      return c.dataValues.id;
    }
    return undefined;
  };


  Product.associate = function() {
    app.model.Product.hasMany(app.model.SkuId);
  };

  return Product;

};
