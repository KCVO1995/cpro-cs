/*
 * :file description:
 * :name: /cpro-cs/app/service/product.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-23 20:14:21
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-28 16:53:15
 */
'use strict';
const Service = require('egg').Service;
const async = require('async');
const { APIS, SHOP_INFO } = require('../constants/index');

class ProductService extends Service {
  async getSpecInfoList(options) {
    const { ctx } = this;
    return async
      .map(options, (option, cb) => {
        ctx.service.spec
          .getSpecId(option)
          .then(specId => {
            let index = 0;

            return async.map(option.values, (optionValue, cb2) => {
              ctx.service.spec
                .getSpecValueId(specId, optionValue)
                .then(specValueId => {
                  index += 1;
                  cb2(null, {
                    specValueName: optionValue,
                    imageUrl: '',
                    specValueId,
                    sort: index,
                    isOpenSizeRecommend: false,
                  });
                });
            }).then(skuSpecValueList => ({ skuSpecValueList, specId }));
          })
          .then(({ skuSpecValueList, specId }) => {
            cb(null, {
              specId,
              specName: option.name,
              specImgEnable: false,
              skuSpecValueList,
            });
          });
      })
      .catch(e => console.log(e, 'error'));
  }
  async getSkuList(variants) {
    const { ctx } = this;
    return async.map(variants, (variant, cb) => {
      async
        .map([ 1, 2, 3 ], (i, cb2) => {
          const key = `option_${i}`;
          if (variant[key]) {
            ctx.model.SpecValue.getItemByYhsdName(variant[key]).then(
              specValueItem => {
                if (specValueItem.w_spec_value_id) {
                  if (specValueItem.spec.dataValues) {
                    cb2(null, {
                      specId: specValueItem.spec.dataValues.w_spec_id,
                      specValueId: specValueItem.w_spec_value_id,
                    });
                  } else {
                    cb2(null, null);
                  }
                } else {
                  cb2(null, null);
                }
              }
            );
          } else {
            cb2(null, null);
          }
        })
        .then(skuSpecValueList => {
          cb(null, {
            skuStockNum: variant.stock,
            outerSkuCode: variant.id,
            salePrice: variant.price,
            skuSpecValueList: skuSpecValueList.filter(item => !!item),
          });
        });
    });
  }
  async getGoodByProduct(product) {
    const { ctx } = this;
    const good = {
      deductStockType: 2,
      categoryId: 43,
      subTitle: product.short_desc,
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
            templateId: 10000985155,
          },
        ],
      },
      specInfoList: [],
      skuList: [],
      subGoodsType: 101,
      title: product.name,
      wid: 10031336493,
    };
    if (product.vendor) {
      const brandId = await ctx.service.vendor.getBrandId(product.vendor);
      good.brandId = brandId;
    }
    if (product.types) {
      const goodsClassifyIdList = await ctx.service.category.getCategoryIds(
        product.types
      );
      good.goodsClassifyIdList = goodsClassifyIdList;
    }
    if (product.image && product.image.src) {
      good.defaultImageUrl = await ctx.service.image.getWFileUrl(
        product.image.src
      );
    }
    if (product.images.length > 0) {
      good.goodsImageUrl = await ctx.service.image.getWFileUrls(
        product.images.map(item => item.src)
      );
    }
    if (product.options.length > 0) {
      good.specInfoList = await this.getSpecInfoList(product.options);
    }
    if (product.variants.length > 0) {
      good.skuList = await this.getSkuList(product.variants);
    }
    return good;
  }
  afterImportOne(data, product) {
    const { ctx } = this;
    ctx.model.Product.create({
      w_product_id: data.goodsId,
      yhsd_product_id: product.id,
    }).then(res => {
      console.log(res, 'res');
      const { dataValues } = res;
      if (data.skuList.length > 0) { // sku
        data.skuList.forEach((sku, index) => {
          ctx.model.SkuId.create({
            w_sku_id: sku.skuId,
            yhsd_sku_id: product.variants[index].id,
            product_id: dataValues.id,
          });
        });
      }
    });
  }
  async afterUpdateOne(data, product) { // TODO unknown orderId ?
    const { ctx } = this;

    const productId = await ctx.model.Product.getIdByYhsdId(product.id);
    const productSkuList = await ctx.model.SkuId.getProductSkuList(productId);
    const dbSkuList = productSkuList.map(item => item.dataValues);

    data.skuList.forEach((sku, index) => { // 微盟返回的 skuList 在原有list中找不到，需要新增
      const wSkuId = sku.skuId;
      const yhsdSkuId = product.variants[index].id;
      const _sku = dbSkuList.find(
        item => item.w_sku_id === wSkuId && item.yhsd_sku_id === yhsdSkuId
      );
      if (_sku) {
        ctx.model.SkuId.create({
          w_sku_id: sku.skuId,
          yhsd_sku_id: product.variants[index].id,
          product_id: productId,
        });
      }
    });

    // 已被弃用的 skuList
    const wSkuIdList = data.skuList.map(item => item.skuId);
    const yhsdSkuIdList = product.variants.map(item => item.id);
    const unMatchSkuIdList = dbSkuList.filter(
      item =>
        !yhsdSkuIdList.includes(item.yhsd_sku_id) ||
        !wSkuIdList.includes(item.w_sku_id)
    );
    unMatchSkuIdList.forEach(item => {
      ctx.model.SkuId.destroy({
        where: {
          id: item.id,
        },
        truncate: true,
      });
    });
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
          ...good,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(
        res => {
          ctx.logger.info('weimob import product %j', res.data);
          const { code, data } = res.data;
          if (code.errcode === '0') {
            this.afterImportOne(data, product);
          }
          return Promise.reject(res.data);
        },
        e => {
          ctx.logger.error('weimob import customer error %j', e);
        }
      );
  }
  async updateOne(product) {
    const { ctx } = this;
    const wProductId = await ctx.model.Product.getWidByYhsdId(product.id);
    if (!wProductId) return this.importOne(product);
    const access_token = await ctx.service.token.get();
    const good = await this.getGoodByProduct(product);
    return ctx
      .curl(`${APIS.UPDATE_PRODUCT}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          basicInfo: {
            vid: SHOP_INFO.VID,
          },
          goodsId: wProductId,
          ...good,
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(
        res => {
          ctx.logger.info('weimob update product %j', res.data);
          const { code, data } = res.data;
          if (code.errcode === '0') {
            this.afterUpdateOne(data, product);
          }
          return Promise.reject(res.data);
        },
        e => {
          ctx.logger.error('weimob update customer error %j', e);
        }
      );
  }
}

module.exports = ProductService;
