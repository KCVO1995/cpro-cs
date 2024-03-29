/*
 * :file description:
 * :name: /cpro-cs/app/service/product.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-23 20:14:21
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-06 10:31:53
 */
'use strict';
const Service = require('egg').Service;
const async = require('async');
const { APIS } = require('../constants/index');

const defaultImage = 'https://asset.ibanquan.com/image/53f649ffe2931e0b91000007/s_w453h453.png';
class ProductService extends Service {
  getYhsdSkuId(variant) {
    return variant.barcode || variant.id;
  }
  async getSpecInfoList(options) {
    const { ctx } = this;
    return async
      .map(options, (option, cb) => {
        ctx.service.spec
          .getSpecId(option)
          .then(specId => {
            let index = 0;

            return async
              .map(option.values, (optionValue, cb2) => {
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
              })
              .then(skuSpecValueList => ({ skuSpecValueList, specId }));
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
  async getSkuList(variants, options) {
    const { ctx } = this;
    return async.map(variants, (variant, cb) => {
      async
        .map([ 1, 2, 3 ], (i, cb2) => {
          const key = `option_${i}`;
          if (variant[key]) {
            const yhsd_option_id = options[i - 1].id;
            const yhsd_option_values = options[i - 1].values;
            // TODO 友好坑爹
            if (yhsd_option_id && yhsd_option_values.includes(variant[key])) {
              ctx.model.Spec.getIdByYhsdId(yhsd_option_id)
                .then(spec_id => {
                  return ctx.model.SpecValue.getItemByYhsdName(
                    spec_id,
                    variant[key]
                  );
                })
                .then(specValueItem => {
                  if (specValueItem && specValueItem.w_spec_value_id) {
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
                });
            } else {
              cb2(null, null);
            }
          } else {
            cb2(null, null);
          }
        })
        .then(skuSpecValueList => {
          const _skuSpecValueList = skuSpecValueList.filter(item => !!item);
          if (_skuSpecValueList.length > 0) {
            cb(null, {
              skuStockNum: variant.stock > 0 ? variant.stock : 0,
              outerSkuCode: this.getYhsdSkuId(variant),
              salePrice: variant.price,
              skuSpecValueList: _skuSpecValueList,
            });
          } else {
            cb(null, null);
          }
        });
    });
  }
  // 适配 sku 下架的情况，将 sku 的 option 值补充到 product.options 上（友好的坑）
  skuTakeDownAdapter(product) {
    const newProduct = { ...product };
    newProduct.variants.forEach(variant => {
      [ 1, 2, 3 ].forEach(i => {
        const key = `option_${i}`;
        if (variant[key] && i <= newProduct.options.length) {
          const option = newProduct.options[i - 1];
          if (!option.values.includes(variant[key])) {
            option.values.push(variant[key]);
          }
        }
      });
    });
    return newProduct;
  }
  async getGoodByProduct(_product) {
    const { ctx, app } = this;
    const {
      config: {
        shopInfo: {
          goodsTemplateId,
          deliveryId,
          deliveryNodeShipId,
          templateId,
        },
      },
    } = app;

    const product = this.skuTakeDownAdapter(_product);

    const good = {
      deductStockType: 2,
      categoryId: 43,
      subTitle: product.short_desc.substr(0, 60),
      goodsType: 1,
      goodsTemplateId,
      isCanSell: true,
      isMultiSku: true,
      isOnline: product.visibility,
      limitSwitch: false,
      outerGoodsCode: product.id,
      initSales: 0,
      performanceWay: {
        deliveryList: [
          {
            deliveryId,
            deliveryNodeShipId,
            deliveryType: 1,
            templateId,
          },
        ],
      },
      specInfoList: [],
      skuList: [],
      subGoodsType: 101,
      title: product.name.substr(0, 60),
      wid: 10031336493,
    };

    good.defaultImageUrl = await ctx.service.image.getWFileUrl(
      product.image && product.image.src ? product.image.src : defaultImage
    );
    if (product.images.length === 0) product.images.push({ src: defaultImage });
    good.goodsImageUrl = await ctx.service.image.getWFileUrls(
      product.images.map(item => item.src)
    );
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
    if (product.options.length > 0) {
      good.specInfoList = await this.getSpecInfoList(product.options);
    }
    if (product.variants.length > 0) {
      good.skuList = await (
        await this.getSkuList(product.variants, product.options)
      ).filter(item => !!item);
    }
    return good;
  }
  afterImportOne(data, product) {
    const { ctx } = this;
    return ctx.model.Product.create({
      w_product_id: data.goodsId,
      yhsd_product_id: product.id,
    }).then(res => {
      const { dataValues } = res;
      if (data.skuList.length > 0) {
        // sku
        data.skuList.forEach((sku, index) => {
          ctx.model.SkuId.create({
            w_sku_id: sku.skuId,
            yhsd_sku_id: this.getYhsdSkuId(product.variants[index]),
            product_id: dataValues.id,
          });
        });
      }
      return dataValues.id;
    });
  }
  async afterUpdateOne(data, product) {
    const { ctx } = this;

    const productId = await ctx.model.Product.getIdByYhsdId(product.id);
    const productSkuList = await ctx.model.SkuId.getProductSkuList(productId);
    const dbSkuList = productSkuList.map(item => item.dataValues);

    data.skuList.forEach((sku, index) => {
      // 微盟返回的 skuList 在原有list中找不到，需要新增
      const wSkuId = sku.skuId;
      const yhsdSkuId = this.getYhsdSkuId(product.variants[index]);
      const _sku = dbSkuList.find(
        item => item.w_sku_id === wSkuId && item.yhsd_sku_id === yhsdSkuId
      );
      if (!_sku) {
        ctx.model.SkuId.create({
          w_sku_id: sku.skuId,
          yhsd_sku_id: yhsdSkuId,
          product_id: productId,
        });
      }
    });

    // 已被弃用的 skuList
    const wSkuIdList = data.skuList.map(item => item.skuId);
    const yhsdSkuIdList = product.variants.map(item => this.getYhsdSkuId(item));
    const unMatchSkuIdList = dbSkuList.filter(
      item =>
        item.product_id === productId &&
        (!yhsdSkuIdList.includes(item.yhsd_sku_id) ||
          !wSkuIdList.includes(item.w_sku_id))
    );
    unMatchSkuIdList.forEach(item => {
      ctx.model.SkuId.destroy({
        where: {
          id: item.id,
        },
      });
    });
  }
  async importOne(product) {
    const { ctx, app } = this;
    try {
      const access_token = await ctx.service.token.get();
      if (!product) return Promise.reject(new Error('product id is empty'));
      const wProductId = await ctx.model.Product.getWidByYhsdId(product.id);
      if (wProductId) return Promise.resolve('商品已存在');
      const good = await this.getGoodByProduct(product);
      return ctx
        .curl(`${APIS.IMPORT_PRODUCT}?accesstoken=${access_token}`, {
          method: 'POST',
          data: {
            basicInfo: {
              vid: app.config.shopInfo.vid,
            },
            ...good,
          },
          contentType: 'json',
          dataType: 'json',
        })
        .then(res => {
          const { code, data } = res.data;
          if (code.errcode === '0') {
            return this.afterImportOne(data, product);
          }
          return Promise.reject(new Error(code.errmsg));
        });
    } catch (e) {
      return Promise.reject(e || new Error('同步错误'));
    }
  }
  async updateOne(product) {
    try {
      const { ctx, app } = this;
      if (!product) return Promise.reject(new Error('product id is empty'));
      const wProductId = await ctx.model.Product.getWidByYhsdId(product.id);
      if (!wProductId) return this.importOne(product);
      const access_token = await ctx.service.token.get();
      const good = await this.getGoodByProduct(product);
      return ctx
        .curl(`${APIS.UPDATE_PRODUCT}?accesstoken=${access_token}`, {
          method: 'POST',
          data: {
            basicInfo: {
              vid: app.config.shopInfo.vid,
            },
            goodsId: wProductId,
            ...good,
          },
          contentType: 'json',
          dataType: 'json',
        })
        .then(res => {
          const { code, data } = res.data;
          if (code.errcode === '0') {
            this.afterUpdateOne(data, product);
          } else {
            return Promise.reject(res.data);
          }
        });
    } catch (e) {
      return Promise.reject(e || new Error('更新错误'));
    }
  }
  afterDeleteOne(wProductId) {
    const { ctx } = this;
    ctx.model.Product.destroy({
      where: {
        w_product_id: wProductId,
      },
    });
  }
  async deleteOne(product) {
    const { ctx, app } = this;
    const wProductId = await ctx.model.Product.getWidByYhsdId(product.id);
    if (!wProductId) return 'OK';
    const access_token = await ctx.service.token.get();
    return ctx
      .curl(`${APIS.DELETE_PRODUCT}?accesstoken=${access_token}`, {
        method: 'POST',
        data: {
          basicInfo: {
            vid: app.config.shopInfo.vid,
          },
          goodsIdList: [ wProductId ],
        },
        contentType: 'json',
        dataType: 'json',
      })
      .then(res => {
        const { code } = res.data;
        if (code.errcode === '0') {
          this.afterDeleteOne(wProductId);
        } else {
          return Promise.reject(res.data);
        }
      });
  }
}

module.exports = ProductService;
