/*
 * :file description:
 * :name: /cpro-cs/migrations/20220731083522-init-wx_token.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 20:16:18
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-31 16:45:55
 */
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 customers 表
  up: async (queryInterface, Sequelize) => {
    const { DATE, STRING, INTEGER, BIGINT } = Sequelize;
    await queryInterface.createTable('wxTokens', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      token: { type: STRING, unique: true },
      token_expires: { type: BIGINT },
      created_at: DATE(6),
      updated_at: DATE(6),
    });
  },
  // 在执行数据库降级时调用的函数，删除 users 表
  down: async queryInterface => {
    await queryInterface.dropTable('wxTokens');
  },
};
