/*
 * :file description:
 * :name: /cpro-cs/app/model/spec.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-24 23:25:49
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-02 18:13:22
 */
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


  Spec.getWidByYhsdId = async function(yhsd_option_id) {
    const c = await this.findOne({
      where: {
        yhsd_option_id,
      },
    });
    if (c && c.dataValues && c.dataValues.w_spec_id) {
      return c.dataValues.w_spec_id;
    }
    return undefined;
  };

  Spec.getIdByYhsdId = async function(yhsd_option_id) {
    const c = await this.findOne({
      where: {
        yhsd_option_id,
      },
    });
    if (c && c.dataValues && c.dataValues.id) {
      return c.dataValues.id;
    }
    return undefined;
  };


  Spec.getIdByWid = async function(w_spec_id) {
    const c = await this.findOne({
      where: {
        w_spec_id,
      },
    });
    if (c && c.dataValues && c.dataValues.id) {
      return c.dataValues.id;
    }
    return undefined;
  };


  Spec.associate = function() {
    app.model.Spec.hasMany(app.model.SpecValue);
  };

  return Spec;

};
