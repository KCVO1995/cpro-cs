/*
 * :file description:
 * :name: /cpro-cs/migrations/20220802025030-migration-sku_ids_yhsd_sku_id.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-08-02 10:50:30
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-02 14:19:03
 */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { STRING } = Sequelize;
    await queryInterface.changeColumn('sku_ids', 'yhsd_sku_id', {
      type: STRING,
      unique: false,
    });
  },

  async down() {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
