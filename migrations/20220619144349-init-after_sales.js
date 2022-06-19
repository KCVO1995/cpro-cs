/*
 * :file description:
 * :name: /cpro-cs/migrations/20220619144349-init-after_sales.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 22:43:49
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-19 22:53:10
 */
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 after_sales 表
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('after_sales', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: STRING, unique: true },
      rights_order_no: { type: STRING, unique: true },
      yhsd_rights_order_no: { type: STRING, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    });
  },
  // 在执行数据库降级时调用的函数，删除 users 表
  down: async queryInterface => {
    await queryInterface.dropTable('after_sales');
  },
};
