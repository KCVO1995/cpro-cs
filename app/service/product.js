/*
 * :file description:
 * :name: /cpro-cs/app/service/product.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-23 20:14:21
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-26 17:40:56
 */
'use strict';
const Service = require('egg').Service;
const { APIS, SHOP_INFO } = require('../constants/index');

class ProductService extends Service {
  getSpecValueId(optionId, index) {
    return optionId + optionId + index + 1;
  }
  async getGoodByProduct(product) {
    const { ctx } = this;
    const good = {
      deductStockType: 2,
      categoryId: 43,
      goodsDesc: product.short_desc,
      goodsType: 1,
      goodsTemplateId: 1192643230695,
      isCanSell: true,
      isMultiSku: true,
      isOnline: product.visibility,
      limitSwitch: false,
      outerGoodsCode: product.id,
      initSales: 0,
      performanceWay: {
        deliveryList: [
          {
            deliveryId: 10001295124,
            deliveryNodeShipId: 2907478,
            deliveryType: 1,
            templateId: 10000997063,
          },
        ],
      },
      specInfoList: [],
      skuList: [],
      subGoodsType: 101,
      title: product.name,
    };
    // TODO 分类
    if (product.vendor) {
      const brandId = await ctx.service.vendor.getBrandId(product.vendor);
      good.brandId = brandId;
    }
    if (product.image && product.image.src) {
      good.defaultImageUrl = await ctx.service.image.getWFileUrl(product.image.src);
    }
    if (product.images.length > 0) {
      good.goodsImageUrl = await ctx.service.image.getWFileUrls(product.images.map(item => item.src));
    }
    if (product.options.length > 0) {
      good.specInfoList = product.options.map(async option => {
        const specId = await ctx.service.spec.getSpecId(option);
        return {
          specId,
          specName: option.name,
          specImgEnable: false,
          skuSpecValueList: option.values.map(async (item, index) => {
            const specValueId = await ctx.service.spec.getSpecValueId(specId, item);
            return {
              specValueName: item,
              imageUrl: '',
              specValueId,
              sort: index,
              isOpenSizeRecommend: false,
            };
          }),
        };
      });
    }
    if (product.variants.length > 0) {
      good.skuList = product.variants.map(item => {
        const skuSpecValueList = [];
        [ 1, 2, 3 ].forEach(i => {
          const key = `option_${i}`;
          if (item[key]) {
            const option = product.options[i - 1];
            const index = option.values.findIndex(v => v === item[key]);
            if (index < 0) return;

            skuSpecValueList.push({
              specId: option.id,
              specValueId: this.getSpecValueId(option.id, index),
            });
          }
        });
        return {
          skuStockNum: item.stock,
          outerSkuCode: item.id,
          salePrice: item.price,
          skuSpecValueList,
        };
      });
    }
    return good;
  }
  async importOne(product) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    const good = await this.getGoodByProduct(product);
    ctx.logger.info('weimob import product %j', good);
    return ctx
      .curl(`${APIS.IMPORT_PRODUCT}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          basicInfo: {
            vid: SHOP_INFO.VID,
          },
          categoryId: 10003280149212,
          ...good,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(
        res => {
          ctx.logger.info('weimob import product %j', res.data);
          // const { code, data } = res.data;
          // if (
          //   data.errorList.length > 0 &&
          //   data.errorList[0].errorMessage === '该客户已存在'
          // ) {
          //   const errorList = data.errorList;
          //   if (errorList.length > 0 && errorList[0].wid) {
          //     this.afterImportOne(customer, errorList[0].wid);
          //     return 'ok';
          //   }
          //   return Promise.reject(res.data);
          // }
          // if (code.errcode === '0') {
          //   const successList = data.successList;
          //   if (successList.length > 0 && successList[0].wid) {
          //     this.afterImportOne(customer, successList[0].wid);
          //     return 'ok';
          //   }
          //   return Promise.reject(res.data);
          // }
          // return Promise.reject(res.data);
        },
        e => {
          ctx.logger.error('weimob import customer error %j', e);
        }
      );
  }
}

module.exports = ProductService;
