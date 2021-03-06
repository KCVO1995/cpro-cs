/*
 * :file description:
 * :name: /cpro-cs/migrations/20220624152150-init-spec_values.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-19 14:56:53
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-29 22:01:36
 */
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 spec_values 表
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, BIGINT, STRING } = Sequelize;
    await queryInterface.createTable('spec_values', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      w_spec_value_id: { type: BIGINT, unique: true },
      spec_id: { type: INTEGER },
      yhsd_option_value_name: { type: STRING },
      created_at: DATE(6),
      updated_at: DATE(6),
    });
  },
  // 在执行数据库降级时调用的函数，删除 spec_values 表
  down: async queryInterface => {
    await queryInterface.dropTable('spec_values');
  },
};
