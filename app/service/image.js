/*
 * :file description:
 * :name: /cpro-cs/app/service/image.js
 * :author: 李彦辉Jacky
 * :copyright: (c) 2022, Tungee
 * :date created: 2022-06-26 16:36:48
 * :last editor: 李彦辉Jacky
 * :date last edited: 2022-08-05 00:23:40
 */
'use strict';
const Service = require('egg').Service;
const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const path = require('path');

const { APIS } = require('../constants/index');

class ImageService extends Service {
  async getWFileUrl(url) {
    console.log(url, ' rr');
    const { ctx } = this;
    const wUrl = await ctx.model.Image.getWUrlByYhsdUrl(url);
    if (wUrl) return wUrl;
    const access_token = await ctx.service.token.get();
    const fileName = url.match(/image\/(\S*)\/s/)[1];
    const pathName = path.resolve(`tempFile/${fileName}.jpeg`);

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
        timeout: 200000, // 10s
        data: {
          name: fileName,
        },
      });
    }).then(res => {
      fs.unlink(pathName, err => {
        if (err) console.log(err, '删除缓存图片失败');
      }); // 文件上传完毕后删除
      const { code, data } = res.data;
      if (code.errcode === 0 && data.urlInfo.length) {
        const w_url = data.urlInfo[0].url;
        ctx.model.Image.create({ yhsd_url: url, w_url });
        return w_url;
      }
      return undefined;
    });
  }
  async getWFileUrls(urls) {
    return Promise.all(urls.map(u => this.getWFileUrl(u)));
  }
}

module.exports = ImageService;
