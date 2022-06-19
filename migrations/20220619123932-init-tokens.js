/*
 * :file description:
 * :name: /cpro-cs/migrations/20220619123932-init-tokens.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 20:16:18
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-19 20:44:03
 */
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 customers 表
  up: async (queryInterface, Sequelize) => {
    const { DATE, STRING, INTEGER } = Sequelize;
    await queryInterface.createTable('tokens', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      shop_id: { type: STRING, unique: true },
      access_token: { type: STRING, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    });
  },
  // 在执行数据库降级时调用的函数，删除 users 表
  down: async queryInterface => {
    await queryInterface.dropTable('tokens');
  },
};
