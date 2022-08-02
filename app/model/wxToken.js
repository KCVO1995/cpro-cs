/*
 * :file description:
 * :name: /cpro-cs/app/model/wxToken.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-07-31 16:46:56
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-02 14:58:02
 */

'use strict';

module.exports = app => {
  const { DATE, STRING, INTEGER, BIGINT } = app.Sequelize;

  const WxToken = app.model.define(
    'wx_tokens',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      token: { type: STRING, unique: true },
      token_expires: { type: BIGINT, defaultValue: Date.now() + 7000 * 1000 },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return WxToken;
};
