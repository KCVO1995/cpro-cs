/*
 * :file description:
 * :name: /cpro-cs/migrations/20220619065653-init-customers.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 14:56:53
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-22 22:40:13
 */
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 customers 表
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, BIGINT } = Sequelize;
    await queryInterface.createTable('customers', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      wid: { type: BIGINT, unique: true },
      yhsd_id: { type: BIGINT, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    });
  },
  // 在执行数据库降级时调用的函数，删除 users 表
  down: async queryInterface => {
    await queryInterface.dropTable('customers');
  },
};
