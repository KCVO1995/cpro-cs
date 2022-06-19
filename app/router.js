/*
 * :file description:
 * :name: /cpro-cs/app/router.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 15:07:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-19 16:56:23
 */
'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/customer/create', controller.customer.create);
  router.post('/customer/update', controller.customer.update);
};
