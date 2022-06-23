/*
 * :file description:
 * :name: /cpro-cs/app/model/afterSale.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 22:56:43
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-21 21:14:39
 */
'use strict';

module.exports = app => {
  const { DATE, INTEGER, STRING } = app.Sequelize;

  const AfterSale = app.model.define(
    'after_sales',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: STRING, unique: true },
      rights_order_no: { type: STRING, unique: true },
      yhsd_rights_order_no: { type: STRING, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  AfterSale.associate = function() {
    app.model.AfterSale.belongsTo(app.model.Order, {
      foreignKey: 'order_id',
    });
  };
  return AfterSale;

};
