/*
 * :file description:
 * :name: /cpro-cs/migrations/20220623094832-init-products.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 14:56:53
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-23 17:59:30
 */
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 products 表
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, BIGINT } = Sequelize;
    await queryInterface.createTable('products', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      w_product_id: { type: BIGINT, unique: true },
      yhsd_product_id: { type: BIGINT, unique: true },
      created_at: DATE(6),
      updated_at: DATE(6),
    });
  },
  // 在执行数据库降级时调用的函数，删除 products 表
  down: async queryInterface => {
    await queryInterface.dropTable('products');
  },
};
