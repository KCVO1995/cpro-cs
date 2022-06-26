/*
 * :file description:
 * :name: /cpro-cs/app/model/specValue.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-24 23:27:23
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-26 15:48:44
 */
'use strict';

module.exports = app => {
  const { DATE, INTEGER, BIGINT, STRING } = app.Sequelize;

  const SpecValue = app.model.define(
    'spec_values',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      w_spec_value_id: { type: BIGINT, unique: true },
      spec_id: { type: INTEGER, unique: true },
      yhsd_option_value_name: { type: STRING },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  SpecValue.associate = function() {
    app.model.SpecValue.belongsTo(app.model.Spec, {
      foreignKey: 'spec_id',
    });
  };

  return SpecValue;

};
