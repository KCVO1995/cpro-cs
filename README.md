# cpro-cs



## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


### 创建数据库
```bash
docker run --name money -v "$PWD/cpro-cs-data":/var/lib/mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=kcvo -d mysql:5.7
```

### 进入容器&登录mysql
```bash
docker exec -it id bash
mysql -u root -p
```

初始化数据库
```bash
CREATE DATABASE cs_development CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE cs_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE cs_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

查表头
```bash
show columns from sku_ids;
```

无法同步问题
 商品
  1. skuList 为空
  2. sku 有下架状态的
  3. 没有默认图片
 客户
  1. email 注册的
  2. 账号无法获取 unionId, 未关注公众号

[egg]: https://eggjs.org