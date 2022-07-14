/*
 * :file description:
 * :name: /cpro-cs/app/service/order.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-20 21:34:58
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-07-14 18:31:39
 */
'use strict';
// app/service/user.js
const Service = require('egg').Service;
const async = require('async');
const { APIS } = require('../constants/index');

// TODO 优惠金额存在问题
// TODO 添加商品完成后需要延时一会, 导入商品后，立刻导入订单会出现 skuId 不存在
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
    const itemInfoList = await async.map(order.items, (item, cb) => {
      ctx.model.Product.getIdByYhsdId(item.product_id)
        .then(id => {
          console.log(id, 'ppppp id');
          if (id) return id;
          return ctx.helper.getYhsdProduct(item.product_id).then(product => {
            return ctx.service.product
              .importOne(product)
              .then(() => ctx.helper.sleep(800));
          });
        })
        .then(() => {
          return ctx.model.SkuId.getWidByYhsdId(item.barcode || item.variant_id);
        })
        .then(wSkuId => {
          console.log(wSkuId, 'wSkuId');
          if (wSkuId) {
            const price = item.price * item.quantity;
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
                payAmount: price,
                totalAmount: price,
                shouldPayAmount: price,
                amountInfos: [
                  {
                    type: 1,
                    amount: price,
                    payAmount: price,
                    shouldPayAmount: price,
                  },
                ],
              },
            });
          } else {
            cb(null, null);
          }
        });
    });
    return itemInfoList.filter(item => item);
  }
  getTime(date) {
    return date ? new Date(date).getTime() : '';
  }
  getTimeList(order) {
    const timeList = [];
    if (order.created_at) {
      timeList.push({ type: 101, value: this.getTime(order.created_at) });
    }
    if (order.pay_at) {
      timeList.push({ type: 102, value: this.getTime(order.pay_at) });
    }
    return timeList;
  }
  async getCustomerWid(customer) {
    const { ctx } = this;
    const wid = await ctx.model.Customer.getWidByYhsdId(customer.id);
    if (wid) return wid;
    await ctx.service.customer.importOne(customer);
    return await ctx.model.Customer.getWidByYhsdId(customer.id);
  }
  async getOrderInfo(order) {
    const { app } = this;
    const { customer, address } = order;
    const wid = await this.getCustomerWid(customer);
    const discountInfoList = this.getDiscountInfoList(order);
    const itemInfoList = await this.getItemInfoList(order);
    const timeList = this.getTimeList(order);
    return {
      buyerInfo: {
        userNickName: customer.name,
        wid,
      },
      deliveryInfo: {
        deliveryType: 1,
        receiveInfo: {
          addressInfo: {
            address: address.complete_address,
            province: address.province,
            area: address.district || '未知',
            city: address.city,
            county: address.country || '中国',
            zip: address.zipcode || '111111',
            addressExt: {
              areaCode: address.district_code,
              cityCode: address.city_code,
              countyCode: '500101',
              provinceCode: address.province_code,
            },
          },
          receiverInfo: {
            receiverMobile: address.mobile,
            receiverName: address.name,
          },
        },
        sendInfo: {
          senderMobile: '17344429467', // TODO
          senderName: 'cpro',
        },
      },
      discountInfoList,
      itemInfoList,
      merchantInfo: {
        processVid: app.config.shopInfo.vid,
        processVidType: 2,
        vid: app.config.shopInfo.vid,
        vidType: 2,
      },
      orderBaseInfo: {
        channelType: 280,
        deliveryType: 1,
        payStatus: order.payment_status === 'paid' ? 2 : 0,
        payTime:
          order.payment_status === 'paid'
            ? new Date(order.pay_at).getTime()
            : '',
        payType: 1,
        outerOrderNo: order.order_no,
        saleChannelType: 10001,
        bizSourceType: 1,
        orderStatus: order.payment_status === 'paid' ? 2 : 0,
        timeList,
      },
      payInfo: {
        payAmount: order.total_amount,
        totalAmount: order.total_amount,
        totalDiscountAmount: 0,
        // totalAmount: order.total_amount + order.discount_amount,
        // totalDiscountAmount: order.discount_amount,
        shouldPayAmount: order.total_amount,
        amountInfos: [
          {
            // 商品金额
            type: 1,
            amount: order.item_amount,
            payAmount: order.item_amount,
            shouldPayAmount: order.item_amount,
          },
          {
            // 运费
            type: 250,
            amount: order.shipment_amount,
            payAmount: order.shipment_amount,
            shouldPayAmount: order.shipment_amount,
          },
        ],
      },
    };
  }
  async afterImportOne(yhsdOrderId, orderData) {
    const { ctx } = this;
    const {
      outputInfo: { orderNo },
    } = orderData;
    ctx.model.Order.create({
      yhsd_order: yhsdOrderId,
      w_order: orderNo,
    });
    return 'ok';
  }
  async importOne(order) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
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
      .then(res => {
        const { code, data } = res.data;
        if (code.errcode === '0') {
          return this.afterImportOne(order.id, data);
        }
        return Promise.reject(res);
      });
  }
  // TODO 无法同步取消信息
  async cancelOne(order) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    let orderNo = await ctx.model.Order.getWidByYhsdId(order.id);
    if (!orderNo) {
      await this.importOne(order);
      orderNo = await ctx.model.Order.getWidByYhsdId(order.id);
    }

    return ctx
      .curl(`${APIS.CANCEL_ORDER}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          cancelReason: '客户取消订单',
          orderNo,
          specificCancelReason: '客户取消订单',
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(res => {
        const { code } = res.data;
        if (code.errcode === '0') {
          return true;
        }
        return Promise.reject(res);
      });
  }
  // {"code":{"errcode":"00145037020040003","errmsg":"[发货失败]履约父单不存在","globalTicket":"29452-1657794616.433-saas-w1-455-47695573803","monitorTrackId":"2de1ce9f-6ba2-457a-a4a2-04a7b2b61549"},"data":null}
  async deliverOne(order) {
    const { ctx, app } = this;
    const access_token = await ctx.service.token.get();
    let orderNo = await ctx.model.Order.getWidByYhsdId(order.id);
    if (!orderNo) {
      await this.importOne(order);
      orderNo = await ctx.model.Order.getWidByYhsdId(order.id);
    }
    orderNo = parseInt(orderNo);

    const fulfillItems = [];
    order.shipments.forEach(shipment => {
      fulfillItems.push({
        orderItemId: orderNo,
        skuNum: shipment.items.length,
      });
    });

    return ctx
      .curl(`${APIS.DELIVER_ORDER}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          logistics: {
            deliveryNo: 'SF365546724374',
            deliveryCompanyCode: 'shunfeng',
            deliveryCompanyName: '顺丰速运',
          },
          orderNo,
          isSplitPackage: order.shipments.length > 1,
          fulfillMethod: 1,
          fulfillItems,
          operatorVo: {
            operatorId: '10037478263',
            operatorName: '管理员',
            operatorPhone: '17344429467',
          },
          basicInfo: {
            vid: app.config.shopInfo.vid,
            vidType: 10,
          },
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(res => {
        const { code } = res.data;
        if (code.errcode === '0') {
          return true;
        }
        return Promise.reject(res);
      });
  }
}

module.exports = OrderService;
