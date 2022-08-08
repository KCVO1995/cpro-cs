/*
 * :file description:
 * :name: /cpro-cs/app/service/order.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-20 21:34:58
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-06 21:11:19
 */
'use strict';
// app/service/user.js
const Service = require('egg').Service;
const async = require('async');
const { APIS } = require('../constants/index');

// TODO 优惠金额存在问题
// TODO 添加商品完成后需要延时一会, 导入商品后，立刻导入订单会出现 skuId 不存在
// TODO 无法同步取消信息
class OrderService extends Service {
  getOrderStatus(order) {
    if (order.status === 'cancel' || order.status === 'refunded') return 9; // 已取消 & 已退款
    if (order.status === 'achieved') return 8; // 已完成
    if (order.status === 'processing') {
      if (order.payment_status === 'pending') return 0; // 创建未付款
      if (order.payment_status === 'paid') {
        // 创建已付款
        if (order.shipment_status === 'pending') return 3; // 待发货
        if (
          order.shipment_status === 'sending' ||
          order.shipment_status === 'partial'
        ) {
          return 5;
        } // 已发货
        if (order.shipment_status === 'recieved') return 7; // 已发货
        return 2;
      }
    }
    return 0; // 创建
  }
  getTimeList(order) {
    const { ctx } = this;
    const timeList = [];
    if (order.created_at) {
      // 创建时间
      timeList.push({ type: 101, value: ctx.helper.getTime(order.created_at) });
    }
    if (order.pay_at) {
      // 支付时间
      timeList.push({ type: 102, value: ctx.helper.getTime(order.pay_at) });
      timeList.push({ type: 103, value: ctx.helper.getTime(order.pay_at) });
    }
    if (
      order.shipments.length > 0 &&
      (order.shipment_status === 'sending' ||
        order.shipment_status === 'partial' ||
        order.shipment_status === 'pending')
    ) {
      // 可发货时间
      timeList.push({
        type: 103,
        value: ctx.helper.getTime(order.shipments[0].created_at),
      });
      // 首次发货时间
      timeList.push({
        type: 104,
        value: ctx.helper.getTime(order.shipments[0].created_at),
      });
      // 发货完成时间
      timeList.push({
        type: 105,
        value: ctx.helper.getTime(order.shipments[0].updated_at),
      });
    }
    if (order.shipments.length > 0 && order.shipment_status === 'recieved') {
      // 可发货时间
      timeList.push({
        type: 103,
        value: ctx.helper.getTime(order.shipments[0].created_at),
      });
      // 首次发货时间
      timeList.push({
        type: 104,
        value: ctx.helper.getTime(order.shipments[0].created_at),
      });
      // 发货完成时间
      timeList.push({
        type: 105,
        value: ctx.helper.getTime(order.shipments[0].updated_at),
      });
      timeList.push({
        type: 106,
        value: ctx.helper.getTime(order.shipments[0].receive_at),
      });
    }
    if (order.status === 'achieved') {
      timeList.push({ type: 107, value: ctx.helper.getTime(order.updated_at) });
    }
    if (order.status === 'cancel' || order.status === 'refunded') {
      timeList.push({ type: 108, value: ctx.helper.getTime(order.close_at) });
    }
    return timeList;
  }
  getCancelInfo(order) {
    if (order.status === 'cancel') {
      return {
        cancelType: 1,
        reason: '买家取消',
        specialReason: '买家取消',
      };
    }
    if (order.status === 'refunded') {
      return {
        cancelType: 1,
        reason: '已退款',
        specialReason: '已退款',
      };
    }
    return null;
  }
  getReceiveInfo(order) {
    const { address } = order;
    return {
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
    };
  }
  getSendInfo() {
    return {
      senderMobile: '17344429467', // TODO
      senderName: 'cpro',
    };
  }
  getPackageList(order) {
    const { ctx } = this;
    const { shipment_status, shipments } = order;
    const receiveInfo = this.getReceiveInfo(order);
    const sendInfo = this.getSendInfo(order);
    if (shipment_status !== 'pending') {
      const packageList = [];
      shipments.forEach((shipment, index) => {
        const packageItems = [];
        shipment.items.forEach(item => {
          packageItems.push({
            outItemId: ctx.service.product.getYhsdSkuId(item),
            skuNum: item.quantity,
          });
        });
        packageList.push({
          deliveryImportInfo: {
            companyCode: 'shunfeng',
            companyName: '顺丰速运',
            expectReceivedType: 5,
            expectReceivedTypeName: '尽快送达',
            number: shipment.ship_no,
            writeOffName: 'kitty',
          },
          deliveryMethod: 1,
          deliveryTime: ctx.helper.getTime(shipment.created_at),
          packageName: `包裹${index}`,
          receiveInfo,
          sendInfo,
          packageItems,
          confirmType: 1,
        });
      });
      return packageList;
    }
    return null;
  }
  getDeliveryInfo(order) {
    const packageList = this.getPackageList(order);
    const receiveInfo = this.getReceiveInfo(order);
    const sendInfo = this.getSendInfo(order);
    const deliveryInfo = {
      deliveryType: 1,
      receiveInfo,
      sendInfo,
    };
    if (packageList) deliveryInfo.packageList = packageList;
    return deliveryInfo;
  }
  getMerchantInfo() {
    const { app } = this;
    return {
      processVid: app.config.shopInfo.vid,
      processVidType: 2,
      vid: app.config.shopInfo.vid,
      vidType: 2,
    };
  }
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
  getOrderBaseInfo(order) {
    const { ctx } = this;
    const timeList = this.getTimeList(order);
    const orderStatus = this.getOrderStatus(order);
    return {
      channelType: 280,
      deliveryType: 1,
      payStatus: order.payment_status === 'paid' ? 2 : 0,
      payTime:
        order.payment_status === 'paid' ? ctx.helper.getTime(order.pay_at) : '',
      payType: 1,
      outerOrderNo: `.${order.order_no}`,
      saleChannelType: 10001,
      bizSourceType: 1,
      orderStatus,
      timeList,
    };
  }
  getPayInfo(order) {
    // TODO 只同步商品金额，没同步运费
    const total = order.item_amount;
    return {
      payAmount: total,
      totalAmount: total,
      totalDiscountAmount: 0,
      // totalDiscountAmount: order.discount_amount,
      shouldPayAmount: total,
      amountInfos: [
        {
          // 商品金额
          type: 1,
          amount: order.item_amount,
          payAmount: order.item_amount,
          shouldPayAmount: order.item_amount,
        },
        // {
        //   // 运费
        //   type: 250,
        //   amount: order.shipment_amount,
        //   payAmount: order.shipment_amount,
        //   shouldPayAmount: order.shipment_amount,
        // },
      ],
    };
  }
  payFinishInfos(order) {
    const { ctx } = this;
    const payFinishInfos = [];
    if (order.payment_status === 'paid' && order.payments.length > 0) {
      order.payments.forEach(payment => {
        payFinishInfos.push({
          channelTrxNo: payment.gateway_payment_no,
          payAmount: payment.amount,
          payMethod: 2,
          payTime: ctx.helper.getTime(payment.created_at),
        });
      });
      return payFinishInfos;
    }
    return null;
  }
  async getItemInfoList(order) {
    const { ctx } = this;
    const itemInfoList = await async.map(order.items, (item, cb) => {
      ctx.model.Product.getIdByYhsdId(item.product_id)
        .then(id => {
          if (id) return id;
          return ctx.helper.getYhsdProduct(item.product_id).then(product => {
            return ctx.service.product.importOne(product).then(() => {
              ctx.helper.sleep(800);
              return ctx.model.Product.getIdByYhsdId(item.product_id);
            });
          });
        })
        .then(productId => {
          const skuId = ctx.service.product.getYhsdSkuId(item);
          return ctx.model.SkuId.getWidByYhsdId(skuId, productId);
        })
        .then(wSkuId => {
          if (wSkuId) {
            const price = item.price * item.quantity;
            cb(null, {
              discountInfoList: [],
              goodsInfo: {
                salePrice: item.price,
                skuId: wSkuId,
                skuCode: wSkuId,
                skuNum: item.quantity,
                goodsSellMode: 1,
              },
              outItemId: ctx.service.product.getYhsdSkuId(item),
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
        })
        .catch(() => {
          cb(null, null);
        });
    });
    return itemInfoList.filter(item => item);
  }
  async getCustomerWid(customer) {
    const { ctx } = this;
    const wid = await ctx.model.Customer.getWidByYhsdId(customer.id);
    if (wid) return wid;
    await ctx.service.customer.importOne(customer);
    return await ctx.model.Customer.getWidByYhsdId(customer.id);
  }
  async getOrderInfo(order) {
    const { customer } = order;
    const wid = await this.getCustomerWid(customer);
    // const discountInfoList = this.getDiscountInfoList(order);
    const itemInfoList = await this.getItemInfoList(order);
    const cancelInfo = this.getCancelInfo(order);
    const deliveryInfo = this.getDeliveryInfo(order);
    const merchantInfo = this.getMerchantInfo();
    const orderBaseInfo = this.getOrderBaseInfo(order);
    const payInfo = this.getPayInfo(order);
    const data = {
      buyerInfo: {
        userNickName: customer.name,
        wid,
      },
      deliveryInfo,
      // discountInfoList,
      itemInfoList,
      merchantInfo,
      orderBaseInfo,
      payInfo,
    };
    if (cancelInfo) {
      data.cancelInfo = cancelInfo;
    }
    return data;
  }
  async afterImportOne(yhsdOrderId, orderData) {
    const { ctx } = this;
    const {
      outputInfo: { orderNo },
    } = orderData;
    ctx.helper.updateOrCreate(ctx.model.Order, { yhsd_order: yhsdOrderId }, {
      yhsd_order: yhsdOrderId,
      w_order: orderNo,
    });
    // return ctx.model.Order.create({
    //   yhsd_order: yhsdOrderId,
    //   w_order: orderNo,
    // });
  }
  async importOne(order) {
    try {
      const { ctx } = this;
      const orderNo = await ctx.model.Order.getWidByYhsdId(order.id);
      if (orderNo) return Promise.resolve('订单已存在');

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
          return Promise.reject(new Error(code.errmsg));
        });
    } catch (e) {
      return Promise.reject(e || '订单导入失败');
    }
  }
  async getOrderNo(order) {
    const { ctx } = this;

    let orderNo = await ctx.model.Order.getWidByYhsdId(order.id);
    if (orderNo) return orderNo;
    await this.importOne(order);
    orderNo = await ctx.model.Order.getWidByYhsdId(order.id);
    return orderNo;
  }

  async updateOne(order) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    const orderNo = await this.getOrderNo(order);
    const timeList = this.getTimeList(order);
    const orderStatus = this.getOrderStatus(order);
    const cancelInfo = this.getCancelInfo(order);
    const payFinishInfos = this.payFinishInfos(order);

    const data = {
      orderNo,
      orderStatus,
      orderTimeInfos: timeList,
      enableDeliveryTime: ctx.helper.getTime(new Date()),
    };
    if (cancelInfo) data.cancelInfo = cancelInfo;
    if (payFinishInfos) data.payFinishInfos = payFinishInfos;

    return ctx
      .curl(`${APIS.UPDATE_ORDER}?accesstoken=${access_token}`, {
        method: 'POST',
        data,
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
