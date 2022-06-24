'use strict';

module.exports = app => {
  const { DATE, INTEGER, BIGINT, STRING } = app.Sequelize;

  const Spec = app.model.define(
    'specs',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      w_spec_id: { type: BIGINT, unique: true },
      yhsd_option_id: { type: BIGINT, unique: true },
      yhsd_option_name: { type: STRING },
      created_at: DATE(6),
      updated_at: DATE(6),
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  Spec.associate = function() {
    app.model.Spec.hasMany(app.model.SpecValue);
  };

  return Spec;

};
