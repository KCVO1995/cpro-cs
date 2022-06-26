/*
 * :file description:
 * :name: /cpro-cs/migrations/20220626082238-init-images.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-26 16:22:38
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-26 16:24:58
 */
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 images 表
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('images', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      w_url: { type: STRING },
      yhsd_url: { type: STRING },
      created_at: DATE(6),
      updated_at: DATE(6),
    });
  },
  // 在执行数据库降级时调用的函数，删除 images 表
  down: async queryInterface => {
    await queryInterface.dropTable('images');
  },
};
