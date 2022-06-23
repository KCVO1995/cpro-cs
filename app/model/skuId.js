/*
 * :file description:
 * :name: /cpro-cs/app/model/skuId.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-23 20:05:35
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-23 20:10:51
 */
/*
 * :file description:
 * :name: /cpro-cs/app/model/product.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-23 20:03:06
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-23 20:04:51
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
  const { DATE, INTEGER, BIGINT } = app.Sequelize;

  const SkuId = app.model.define(
    'sku_ids',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      w_sku_id: { type: BIGINT, unique: true },
      yhsd_sku_id: { type: BIGINT, unique: true },
      product_id: { type: INTEGER },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  SkuId.associate = function() {
    app.model.SkuId.belongsTo(app.model.Product, {
      foreignKey: 'product_id',
    });
  };

  return SkuId;

};
