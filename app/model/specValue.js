/*
 * :file description:
 * :name: /cpro-cs/app/model/specValue.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-24 23:27:23
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-27 15:01:13
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

  SpecValue.getItemByYhsdName = async function(yhsd_option_value_name) {
    const c = await this.findOne({
      where: {
        yhsd_option_value_name,
      },
      include: [{ model: app.model.Spec }],
    });
    if (c && c.dataValues) {
      return c.dataValues;
    }
    return undefined;
  };

  SpecValue.getWidByYhsdName = async function(yhsd_option_value_name) {
    const c = await this.findOne({
      where: {
        yhsd_option_value_name,
      },
    });
    if (c && c.dataValues && c.dataValues.w_spec_value_id) {
      return c.dataValues.w_spec_value_id;
    }
    return undefined;
  };

  SpecValue.associate = function() {
    app.model.SpecValue.belongsTo(app.model.Spec, {
      foreignKey: 'spec_id',
    });
  };

  return SpecValue;

};
