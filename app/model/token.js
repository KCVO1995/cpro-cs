/*
 * :file description:
 * :name: /cpro-cs/app/model/token.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 20:30:22
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-19 20:44:17
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
  const { DATE, STRING, INTEGER } = app.Sequelize;

  const Token = app.model.define(
    'tokens',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      access_token: { type: STRING, unique: true },
      shop_id: { type: STRING, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Token;
};
