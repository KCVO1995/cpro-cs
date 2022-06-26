/*
 * :file description:
 * :name: /cpro-cs/app/service/product.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-23 20:14:21
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-06-26 15:46:08
 */
'use strict';
const Service = require('egg').Service;
const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const path = require('path');

const { APIS, SHOP_INFO } = require('../constants/index');

class ProductService extends Service {
  getSpecValueId(optionId, index) {
    return optionId + optionId + index + 1;
  }
  async getWFileUrl(url) {
    const { ctx } = this;
    const access_token = await ctx.service.token.get();
    const fileName = url.match(/image\/(\S*)\/s/)[1];
    const pathName = path.resolve('tempFile/file.jpeg');

    const file = fs.createWriteStream(pathName);
    return new Promise((resolve, reject) => {
      const request = https.get(
        url,
        function(response) {
          response.pipe(file);
          file.on('finish', () => {
            file.close(() => {
              resolve();
            });
          });
          request.on('error', () => {
            fs.unlink(pathName, () => { reject(new Error('上传失败')); });
          });
          file.on('error', () => {
            // Handle errors
            fs.unlink(pathName, () => { reject(new Error('上传失败')); });
          });
        }
      );
    }).then(() => {
      return ctx.curl(`${APIS.UPLOAD_FILE}?accesstoken=${access_token}`, {
        method: 'POST',
        dataType: 'json',
        files: pathName,
        data: {
          name: fileName,
        },
      });
    }).then(res => {
      const { code, data } = res.data;
      if (code.errcode === 0 && data.urlInfo.length) {
        return data.urlInfo[0].url;
      }
      return undefined;
    });
  }
  async getWFileUrls(urls) {
    return Promise.all(urls.map(u => this.getWFileUrl(u)));
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
      // wid: '', // TODO,
    };
    if (product.vendor) {
      const brandId = await ctx.service.vendor.getBrandId(product.vendor);
      console.log(brandId, '--------brandId--------');
      good.brandId = brandId;
    }
    if (product.image && product.image.src) {
      good.defaultImageUrl = await this.getWFileUrl(product.image.src);
    }
    if (product.images.length > 0) {
      good.goodsImageUrl = await this.getWFileUrls(product.images.map(item => item.src));
    }
    if (product.options.length > 0) {
      good.specInfoList = product.options.map(option => ({
        specId: option.id,
        specName: option.name,
        specImgEnable: false,
        skuSpecValueList: option.values.map((item, index) => ({
          specValueName: item,
          imageUrl: '',
          specValueId: this.getSpecValueId(option.id, index),
          sort: index,
          isOpenSizeRecommend: false,
        })),
      }));
    }
    if (product.variants.length > 0) {
      good.skuList = product.variants.map(item => {
        const skuSpecValueList = []

        ;[ 1, 2, 3 ].forEach(i => {
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
