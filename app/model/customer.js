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
  const { DATE, INTEGER } = app.Sequelize;

  const Customer = app.model.define(
    'customers',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      wid: { type: INTEGER, unique: true },
      yhsd_id: { type: INTEGER, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  Customer.getWidByYhsdId = async function(yhsdId) {
    const c = await this.findOne({
      where: {
        yhsd_id: yhsdId,
      },
    });
    if (c && c.dataValues && c.dataValues.wid) return c.dataValues.wid;
    return undefined;
  };

  return Customer;

};
