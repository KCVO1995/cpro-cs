/*
 * :file description:
 * :name: /cpro-cs/app/service/order.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-20 21:34:58
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-30 10:21:23
 */
'use strict';
// app/service/user.js
const Service = require('egg').Service;
const async = require('async');
const { APIS, SHOP_INFO } = require('../constants/index');

class OrderService extends Service {
  getDiscountInfoList(order) {
    const discountInfoList = [];
    if (order.discount_amount > 0) {
      discountInfoList.push({
        discountType: 99,
        discountLevel: 2,
        discountAmount: order.discount_amount,
      });
    }
    return discountInfoList;
  }
  async getItemInfoList(order) {
    const { ctx } = this;
    return await async.map(order.items, (item, cb) => {
      ctx.model.SkuId.getWidByYhsdId(item.variant_id).then(wSkuId => {
        console.log(wSkuId, '-------wwww------');
        if (wSkuId) {
          cb(null, {
            discountInfoList: [],
            goodsInfo: {
              salePrice: item.price,
              skuId: wSkuId,
              skuNum: item.quantity,
              goodsSellMode: 1,
            },
            outItemId: item.id,
            payInfo: {
              payAmount: item.price,
              totalAmount: item.price,
              shouldPayAmount: item.price,
              amountInfos: [
                {
                  type: 1,
                  amount: item.price,
                  payAmount: item.price,
                  shouldPayAmount: item.price,
                },
              ],
            },
          });
        } else {
          cb(new Error('sku id not fund'));
        }
      });
    });
  }
  getTime(date) {
    return date ? new Date(date).getTime() : '';
  }
  getTimeList(order) { // TODO
    const timeList = [];
    if (order.created_at) {
      timeList.push({ type: 101, value: this.getTime(order.created_at) });
    }
    if (order.pay_at) {
      timeList.push({ type: 102, value: this.getTime(order.pay_at) });
    }
  }
  async getCustomerWid(customer) {
    const { ctx } = this;
    const wid = await ctx.model.Customer.getWidByYhsdId(customer.id);
    console.log(wid, '------wid------');
    if (wid) return wid;
    await ctx.service.customer.importOne(customer);
    return await ctx.model.Customer.getWidByYhsdId(customer.id);
  }
  async getOrderInfo(order) {
    const { customer, address } = order;
    const wid = await this.getCustomerWid(customer);
    const discountInfoList = this.getDiscountInfoList(order);
    const itemInfoList = await this.getItemInfoList(order);
    const timeList = this.getTimeList(order);
    return {
      buyerInfo: {
        phone: customer.notify_phone,
        userNickName: customer.name,
        wid,
      },
      deliveryInfo: {
        deliveryType: 1,
        receiveInfo: {
          addressInfo: {
            address: address.complete_address,
            addressExt: {
              area: ' ',
              city: address.city,
              county: address.district,
              province: address.province,
              zip: address.zipcode,
            },
          },
          receiverInfo: {
            receiverMobile: address.mobile,
            receiverName: address.name,
          },
        },
      },
      discountInfoList,
      itemInfoList,
      merchantInfo: {
        bosId: SHOP_INFO.SHOP_ID,
        processVid: '', // TODO
        processVidType: 2,
        vid: SHOP_INFO.VID,
        vidType: 10,
      },
      orderBaseInfo: {
        channelType: 2,
        deliveryType: 1,
        payStatus: order.payment_status === 'paid' ? 1 : 0,
        payTime:
          order.payment_status === 'paid'
            ? new Date(order.pay_at).getTime()
            : '',
        payType: 1,
        outerOrderNo: order.order_no,
        saleChannelType: 10001,
        bizSourceType: 1,
      },
      timeList,
      payInfo: {
        payAmount: order.total_amount,
        totalAmount: order.total_amount,
        totalDiscountAmount: order.discount_amount,
        shouldPayAmount: order.total_amount,
        amountInfos: [
          {
            type: 1,
            amount: order.total_amount,
            totalDiscountAmount: order.discount_amount,
            shouldPayAmount: order.total_amount,
          },
        ],
      },
    };
  }
  async importOne(order) {
    const { ctx } = this;
    const access_token = ctx.service.token.get();
    const orderInfo = await this.getOrderInfo(order);

    return ctx
      .curl(`${APIS.IMPORT_ORDER}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          orderInfo,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(
        res => {
          const { code } = res;
          if (code.errcode === '0') {
            return 'ok';
          }
          return Promise.reject(res);
        });
  }
}

module.exports = OrderService;
