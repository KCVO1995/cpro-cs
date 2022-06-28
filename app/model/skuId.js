/*
 * :file description:
 * :name: /cpro-cs/app/model/skuId.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-23 20:05:35
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-28 20:50:35
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

  SkuId.getProductSkuList = async function(product_id) {
    const c = await this.findAll({
      where: {
        product_id,
      },
    });
    return c.length > 0 ? c : [];
  };


  SkuId.associate = function() {
    app.model.SkuId.belongsTo(app.model.Product, {
      foreignKey: 'product_id',
    });
  };

  return SkuId;

};
