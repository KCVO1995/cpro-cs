/*
 * :file description:
 * :name: /cpro-cs/app/router.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-18 15:07:42
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-26 23:54:13
 */
'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // webhook 创建客户
  router.post('/customer/create', controller.customer.create);
  // webhook 更新客户
  router.post('/customer/update', controller.customer.update);
  // webhook 创建商品
  router.post('/product/create', controller.product.create);
  // webhook 更新商品
  router.post('/product/update', controller.product.update);
  // webhook 删除商品
  router.post('/product/delete', controller.product.delete);
  // webhook 创建订单
  router.post('/order/create', controller.order.create);
  // webhook 订单付款
  router.post('/order/paid', controller.order.update);
  // webhook 订单发货
  router.post('/order/delivered', controller.order.update);
  // webhook 订单完成
  router.post('/order/achieved', controller.order.update);
  // webhook 取消订单
  router.post('/order/cancelled', controller.order.update);
  // webhook 订单部分发货
  router.post('/order/partially_delivered', controller.order.update);
  // // webhook 创建售后单
  // router.post('/after_sales/create', controller.afterSale.create);
  // // webhook 取消售后单
  // router.post('/after_sales/cancel', controller.afterSale.cancel);
  // // webhook 更新售后单
  // router.post('/after_sales/update', controller.afterSale.update);
  // webhook 退单请求
  // router.post('/order/request_refund', controller.afterSale.create);
  // // webhook 退单完成
  // router.post('/order/refunded', controller.customer.update);
  // // webhook 拒绝退单
  // router.post('/order/refuse_refund', controller.customer.update);
  // webhook 更新订单
  // router.post('/order/update', controller.order.update);
  // ----
  router.get('/yhsd/api/*', controller.yhsdApi.api);
  router.post('/yhsd/api/*', controller.yhsdApi.api);
  router.put('/yhsd/api/*', controller.yhsdApi.api);
};
