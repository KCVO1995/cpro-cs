/*
 * :file description:
 * :name: /cpro-cs/migrations/20220623120033-init-sku_ids.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 14:56:53
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-02 13:49:23
 */
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 products 表
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, BIGINT, STRING } = Sequelize;
    await queryInterface.createTable('sku_ids', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      w_sku_id: { type: BIGINT, unique: true },
      yhsd_sku_id: { type: STRING },
      product_id: { type: INTEGER },
      created_at: DATE(6),
      updated_at: DATE(6),
    });
  },
  // 在执行数据库降级时调用的函数，删除 products 表
  down: async queryInterface => {
    await queryInterface.dropTable('sku_ids');
  },
};
