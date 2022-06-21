/*
 * :file description:
 * :name: /cpro-cs/app/service/order.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-20 21:34:58
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-20 22:42:19
 */
'use strict';
// app/service/user.js
const Service = require('egg').Service;
const { APIS, BOS_ID } = require('../constants/index');

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
  getItemInfoList(order) {
    const itemInfoList = [];
    order.items.forEach(item => {
      itemInfoList.push({ // TODO 商品名称
        goodsInfo: {
          salePrice: item.price,
          skuId: item.variant_id,
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
    });
    return itemInfoList;
  }
  async importOne(order) {
    const { ctx } = this;
    const access_token = ctx.service.token.get();
    const { customer, address } = order;
    const wid = ctx.model.Customer.getWidByYhsdId(customer.id);
    if (!wid) throw new Error('customer not found');

    const discountInfoList = this.getDiscountInfoList(order);
    const itemInfoList = this.getItemInfoList(order);

    return ctx
      .curl(`${APIS.IMPORT_ORDER}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          orderInfo: {
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
                    area: '',
                    city: address.city,
                    county: address.district,
                    province: address.province,
                    zip: address.zipcode,
                  },
                },
              },
            },
            discountInfoList,
            itemInfoList,
            merchantInfo: {
              bosId: BOS_ID,
              processVid: '', // TODO
              processVidType: 2,
              vid: '', // TODO
              vidType: 2,
            },
            orderBaseInfo: {
              channelType: 2,
              deliveryType: 1,
              payStatus: order.payment_status === 'paid' ? 1 : 0,
              payTime: '', // TODO
              payType: 1,
              outerOrderNo: order.order_no,
              saleChannelType: 10001,
              bizSourceType: 1,
            },
            timeList: [
              // TODO
              {
                type: 101,
                value: new Date(order.created_at).getTime(),
              },
            ],
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
          },
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(
        res => {
          ctx.logger.info('weimob import customer %j', res.data);
          const { code } = res;
          if (code.errcode === '0') {
            return 'ok';
          }
          return Promise.reject(res);
        },
        e => {
          ctx.logger.error('weimob import customer error %j', e);
        }
      );
  }
}

module.exports = OrderService;
