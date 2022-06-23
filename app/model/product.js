/*
 * :file description:
 * :name: /cpro-cs/app/model/product.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 14:59:45
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-23 20:10:31
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

  Product.associate = function() {
    app.model.Order.hasMany(app.model.SkuId);
  };

  return Product;

};
