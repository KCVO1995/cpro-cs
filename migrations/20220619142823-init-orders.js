/*
 * :file description:
 * :name: /cpro-cs/migrations/20220619142823-init-orders.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 14:56:53
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-19 22:44:00
 */
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 orders 表
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('orders', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      yhsd_order: { type: STRING, unique: true },
      w_order: { type: STRING, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    });
  },
  // 在执行数据库降级时调用的函数，删除 users 表
  down: async queryInterface => {
    await queryInterface.dropTable('orders');
  },
};
