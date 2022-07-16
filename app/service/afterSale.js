/*
 * :file description:
 * :name: /cpro-cs/app/service/aftersale.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-07-16 17:20:33
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-16 23:35:49
 */
/*
 * :file description:
 * :name: /cpro-cs/app/service/order.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-20 21:34:58
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-14 22:54:27
 */
'use strict';
// app/service/user.js
const Service = require('egg').Service;
const { APIS } = require('../constants/index');

// TODO operator
class AfterSaleService extends Service {
  getMerchantInfo() {
    const { app } = this;
    return {
      processVid: app.config.shopInfo.vid,
      // processVidType: 2,
      vid: app.config.shopInfo.vid,
      // vidType: 2,
    };
  }
  getOperator() {
    return {
      operatorId: '10037478263',
    };
  }
  async getOriginOrder(order) {
    const { ctx } = this;
    const orderNo = await ctx.service.order.getOrderNo(order);
    return {
      orderNo,
      outOrderNo: order.id,
    };
  }
  getRightsItems(afterSale, wOrderInfo, orderInfo) {
    const rightsItems = [];
    afterSale.items.forEach(item => {
      const orderItem = orderInfo.items.find(t => t.id === item.trade_item_id);
      const wOrderItem = wOrderInfo.items.find(wItem => {
        const id = orderItem.barcode || orderInfo.id;
        return wItem.skuCode === id;
      });
      const data = {
        applyNum: item.refund_count,
        goodsReceiveType:
            afterSale.order.shipment_status === 'recieved'
              ? item.refund_count
              : 0,
        orderItemId: wOrderItem.itemId,
        outOrderItemId: wOrderItem.skuCode,
        outRightsItemId: item.trade_item_id + afterSale.id,
      };
      if (afterSale.after_sale_type === 2) data.exchangeGoods = [];
      rightsItems.push(data);
    });
  }
  async getWeiMoOrder(wOrderNo) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    return ctx
      .curl(`${APIS.GET_ORDER}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          orderDomains: [ 1 ],
          orderNo: wOrderNo,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(res => {
        const { code, data } = res.data;
        if (code.errcode === '0') {
          return data.orderInfo;
        }
        return Promise.reject(res);
      });
  }
  getRightsType(afterSale) {
    const { after_sale_type } = afterSale;
    if (after_sale_type === 0) return 2;
    if (after_sale_type === 1) return 1;
    if (after_sale_type === 2) return 5;
    return 2;
  }
  getRightsStatus(afterSale) {
    const { status } = afterSale;
    if (status === 0 || status === 10 || status === 20) return 1; // 创建
    if (status === 11 || status === 21) return 2; // 等待买家退货
    if (status === 12 || status === 22) return 3; // 买家已退货
    if (status === 1 || status === 12) return 5; // 系统退款中
    if (status === 2 || status === 14) return 6; // 系统已退款
    if (status === 99) return 7; // 取消
    if (status === 3 || status === 15 || status === 26) return 8; // 商家拒绝
    if (status === 4 || status === 16) return 9; // 退款失败
    if (status === 1 || status === 13) return 10; // 商家退款中
    if (status === 21) return 20;
    return 1;
  }
  async getRightsOrder(afterSale) {
    const { ctx } = this;
    const rightsType = this.getRightsType(afterSale);
    const rightsStatus = this.getRightsStatus(afterSale);
    return {
      channelType: 280,
      operations: [],
      outCreateTime: ctx.helper.getTime(afterSale.created_at),
      outRightsId: afterSale.id,
      refundType: afterSale.after_sale_type === 2 ? 99 : 1, // 2 为换货无需退款
      rightsCauseType: 1,
      rightsSource: 401,
      rightsStatus,
      rightsType,
    };
  }
  getRightsReasonInfo(afterSale) {
    return {
      rightsReason: afterSale.after_sale_reason,
    };
  }
  async getImportData(afterSale) {
    const { ctx } = this;
    console.log(1);
    const merchantInfo = this.getMerchantInfo();
    console.log(2);
    const operator = this.getOperator();
    console.log(3);
    const orderInfo = await ctx.helper.getYhsdOrder(afterSale.order.id);
    console.log(4);
    const originOrder = await this.getOriginOrder(orderInfo);
    console.log(5);
    const wOrderInfo = await this.getWeiMoOrder(originOrder.orderNo);
    const rightsItems = this.getRightsItems(afterSale, wOrderInfo, orderInfo);
    const rightsOrder = this.getRightsOrder(afterSale);
    const rightsReasonInfo = this.getRightsReasonInfo(afterSale);
    const importData = {
      merchantInfo,
      operator,
      originOrder,
      rightsItems,
      rightsOrder,
      rightsReasonInfo,
    };
    return importData;
  }
  async importOne(afterSale) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    const importData = await this.getImportData(afterSale);

    return ctx
      .curl(`${APIS.IMPORT_AFTER_SALE}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          ...importData,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(res => {
        const { code, data } = res.data;
        if (code.errcode === '0') {
          return this.afterImportOne(order.id, data);
        }
        return Promise.reject(res);
      });
  }
}

module.exports = AfterSaleService;
