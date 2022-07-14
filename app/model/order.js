/*
 * :file description:
 * :name: /cpro-cs/app/model/order.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 22:53:41
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-14 17:42:55
 */
/*
 * :file description:
 * :name: /cpro-cs/app/model/customer.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 14:59:45
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-19 15:18:23
 */
'use strict';

module.exports = app => {
  const { DATE, INTEGER, STRING } = app.Sequelize;

  const Order = app.model.define(
    'orders',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      yhsd_order: { type: STRING, unique: true },
      w_order: { type: STRING, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  Order.getWidByYhsdId = async function(yhsd_order) {
    const c = await this.findOne({
      where: {
        yhsd_order,
      },
    });
    if (c && c.dataValues && c.dataValues.w_order) return c.dataValues.w_order;
    return undefined;
  };

  Order.associate = function() {
    app.model.Order.hasMany(app.model.AfterSale);
  };

  return Order;
};
