/*
 * :file description:
 * :name: /cpro-cs/app/service/aftersale.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-07-16 17:20:33
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-20 21:52:07
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

const YHSD_AFTER_SALE_TYPE = {
  REFUND: 0,
  REFUND_AND_RETURN_GOODS: 1,
  EXCHANGE_GOODS: 2,
};

const W_AFTER_SALE_STATUS = {
  REFUND: 2,
  REFUND_AND_RETURN_GOODS: 1,
  EXCHANGE_GOODS: 5,
};

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
      operatorName: 'Kitty',
      operatorPhone: '17344429467',
    };
  }
  async getOriginOrder(order) {
    const { ctx } = this;
    const orderNo = await ctx.service.order.getOrderNo(order);
    return {
      orderNo,
      outOrderNo: order.order_no,
    };
  }
  getExchangeGoods() {
    return {
      goodsCode: 101684604101894,
      goodsId: 101684604101894,
      goodsTitle: '换货商品',
      goodsType: 1,
      imageUrl: [
        'https://image-c.weimobwmc.com/openruntime/4f5535b35af24321b1dfb6875d1a6ddf.jpeg',
      ],
      price: 1,
      skuCode: 'K000010008909177',
      skuId: '104314636101894',
      skuName: '换货商品',
      skuNum: 1,
      subGoodsType: 101,
    };
  }
  getRightsItems(afterSale, wOrderInfo, orderInfo) {
    const { ctx } = this;
    const rightsItems = [];
    afterSale.items.forEach(item => {
      const orderItem = orderInfo.items.find(t => t.id === item.trade_item_id);
      const wOrderItem = wOrderInfo.items.find(wItem => {
        const id = ctx.service.product.getYhsdSkuId(orderItem);
        return wItem.skuCode === id;
      });
      const exchangeGoods = this.getExchangeGoods();
      const data = {
        applyNum: item.refund_count,
        goodsReceiveType:
          afterSale.order.shipment_status === 'recieved'
            ? item.refund_count
            : 0,
        orderItemId: wOrderItem.itemId,
        outOrderItemId: wOrderItem.skuCode,
        outRightsItemId: item.trade_item_id + afterSale.id,
        rightsAssets: [
          {
            assetsAmount: orderItem.price * orderItem.quantity,
            assetsTarget: 0,
            assetsType: 1,
          },
        ],
      };
      if (afterSale.after_sale_type === 2 && exchangeGoods) {
        data.exchangeGoods = exchangeGoods;
      }
      if (afterSale.after_sale_type !== 2) {
        data.refundDetail = {
          applyAmount: item.refund_amount,
          refundAmount: item.refund_amount,
        };
      }
      rightsItems.push(data);
    });
    return rightsItems;
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
    if (after_sale_type === YHSD_AFTER_SALE_TYPE.REFUND) return W_AFTER_SALE_STATUS.REFUND; // 退款
    if (after_sale_type === YHSD_AFTER_SALE_TYPE.REFUND_AND_RETURN_GOODS) return W_AFTER_SALE_STATUS.REFUND_AND_RETURN_GOODS; // 退货退款
    if (after_sale_type === YHSD_AFTER_SALE_TYPE.EXCHANGE_GOODS) return W_AFTER_SALE_STATUS.EXCHANGE_GOODS; // 退换货
    return W_AFTER_SALE_STATUS.REFUND;
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
  getOperations(afterSale) {
    const { ctx } = this;
    const { trackers } = afterSale;
    const operations = [];
    const operator = this.getOperator();
    // 102-同意，103-买家退货，105-商家确认收货，106-退款完成，107-取消，108-拒绝，109-退款失败，110-退款线上转线下，999-申请，998-更新
    if (afterSale.created_at) {
      // 申请
      operations.push({
        type: 999,
        operator,
        datetime: ctx.helper.getTime(afterSale.created_at),
      });
    }
    const timeList = [
      { type: 102, keyword: '同意' },
      { type: 103, keyword: '买家退货' },
      { type: 105, keyword: '确认收货' },
      { type: 106, keyword: '系统退款成功' },
      { type: 107, keyword: '取消' },
      { type: 108, keyword: '拒绝' },
      { type: 109, keyword: '退款失败' },
    ];
    timeList.forEach(({ type, keyword }) => {
      const tracker = trackers.filter(t => t.title.includes(keyword));
      if (tracker.length > 0) {
        operations.push({
          type,
          operator,
          datetime: ctx.helper.getTime(tracker[0].created_at),
        });
      }
    });
    return operations;
  }
  getRightsOrder(afterSale) {
    const { ctx } = this;
    const rightsType = this.getRightsType(afterSale);
    const rightsStatus = this.getRightsStatus(afterSale);
    const operations = this.getOperations(afterSale);
    return {
      channelType: 280,
      operations,
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
  getRefundDetail(afterSale) {
    const { after_sale_type } = afterSale;
    if (after_sale_type === YHSD_AFTER_SALE_TYPE.EXCHANGE_GOODS) return null;
    return {
      applyAmount: afterSale.refund_amount,
      refundAmount: afterSale.refund_amount,
    };
  }
  async getImportData(afterSale) {
    const { ctx } = this;
    const merchantInfo = this.getMerchantInfo();
    const operator = this.getOperator();
    const orderInfo = await ctx.helper.getYhsdOrder(afterSale.order.id);
    const originOrder = await this.getOriginOrder(orderInfo);
    const wOrderInfo = await this.getWeiMoOrder(originOrder.orderNo);
    const rightsItems = this.getRightsItems(afterSale, wOrderInfo, orderInfo);
    const rightsOrder = this.getRightsOrder(afterSale);
    const rightsReasonInfo = this.getRightsReasonInfo(afterSale);
    const refundDetail = this.getRefundDetail(afterSale);
    const importData = {
      merchantInfo,
      operator,
      originOrder,
      // rightsAssets: [{
      //   assetsAmount: afterSale.refund_amount,
      //   assetsTarget: 0,
      //   assetsType: 1,
      // }],
      refundPayInfoList: [
        {
          amount: afterSale.refund_amount,
          refundFailedReason: '...',
          refundMethodId: 3,
          refundStatus: 3,
        },
      ],
      rightsItems,
      rightsOrder,
      rightsReasonInfo,
    };
    if (refundDetail) importData.refundDetail = refundDetail;
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
          return this.afterImportOne(afterSale.id, data);
        }
        return Promise.reject(res);
      });
  }
}

module.exports = AfterSaleService;
