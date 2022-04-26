const { getClient } = require('./connect.js');

console.log('Seeding database...');

// --------------- Seeding the skus data ----------------------
(async () => {
  const client = await getClient();
  let schema = 'id INT PRIMARY KEY, styleId INT, size VARCHAR, quantity INT';
  let createTableQuery = `
    CREATE TABLE IF NOT EXISTS skus (
      ${schema}
    );`;
  const res = await client.query(createTableQuery)
    .then((data) => {console.log(data)})
    .catch((err) => {console.log(err)});

  let skuPath = '/home/toekneedeez/hackreactor/system-design-capstone/csv/skus.csv';
  let copySkuCSV = `COPY skus FROM '${skuPath}' WITH DELIMITER ',' CSV header`;
  const copied = await client.query(copySkuCSV)
    .then(data => {console.log('Successful copy from sku.csv...', data)})
    .catch(err => {console.log('Unsuccessful copy from sku.csv...', err)});

  const indexSkuTable = `CREATE INDEX IF NOT EXISTS skuIndex ON skus (styleId);`
  const indexStyle = await client.query(indexSkuTable)
    .then(data => {console.log('Successful index of skus table on style_id...', data)})
    .catch(err => {console.log('Unsuccessful indexing of skus table...', err)});
  await client.end();
})();

// --------------- Seeding the photos data ----------------------
(async () => {
  const client = await getClient();
  let schema = 'id INT PRIMARY KEY, styleId INT, url VARCHAR, thumbnail_url VARCHAR';
  let createTableQuery = `
    CREATE TABLE IF NOT EXISTS photos (
      ${schema}
    );`;

  const res = await client.query(createTableQuery)
    .then((data) => {console.log(data)})
    .catch((err) => {console.log(err)});

  let photoPath = '/home/toekneedeez/hackreactor/system-design-capstone/csv/photos.csv';
  let copyPhotoCSV = `COPY photos FROM '${photoPath}' WITH DELIMITER ',' CSV header`;
  const copied = await client.query(copyPhotoCSV)
    .then(data => {console.log('Successful copy from photos.csv...', data)})
    .catch(err => {console.log('Unsuccessful copy from photos.csv...', err)});

  const indexPhotoTable = `CREATE INDEX IF NOT EXISTS photoIndex ON photos (styleId);`
  const indexStyle = await client.query(indexPhotoTable)
    .then(data => {console.log('Successful index of photos table on style_id...', data)})
    .catch(err => {console.log('Unsuccessful indexing of photos table...', err)});

  await client.end();
})();

// --------------- Seeding the styles data ----------------------
(async () => {
  const client = await getClient();
  let schema = 'id INT PRIMARY KEY, product_id INT, name VARCHAR, sale_price VARCHAR, original_price VARCHAR, default_style BOOL';
  let createTableQuery = `
    CREATE TABLE IF NOT EXISTS styles (
      ${schema}
    );`;

  const res = await client.query(createTableQuery)
    .then((data) => {console.log(data)})
    .catch((err) => {console.log(err)});

  let stylePath = '/home/toekneedeez/hackreactor/system-design-capstone/csv/styles.csv';
  let copyStyleCSV = `COPY styles FROM '${stylePath}' WITH DELIMITER ',' CSV header`;
  const copied = await client.query(copyStyleCSV)
    .then(data => {console.log('Successful copy from styles.csv...', data)})
    .catch(err => {console.log('Unsuccessful copy from styles.csv...', err)});

  const indexStyleTable = `CREATE INDEX IF NOT EXISTS styleIndex ON styles (product_id);`
  const indexStyle = await client.query(indexStyleTable)
    .then(data => {console.log('Successful index of styles table on product_id...', data)})
    .catch(err => {console.log('Unsuccessful indexing of styles table...', err)});

  await client.end();
})();

// --------------- Seeding the features data ----------------------
(async () => {
  const client = await getClient();
  let schema = 'id INT PRIMARY KEY, product_id INT, feature VARCHAR, value VARCHAR';
  let createTableQuery = `
    CREATE TABLE IF NOT EXISTS features (
      ${schema}
    );`;

  const res = await client.query(createTableQuery)
    .then((data) => {console.log(data)})
    .catch((err) => {console.log(err)});

  let featurePath = '/home/toekneedeez/hackreactor/system-design-capstone/csv/features.csv';
  let copyFeatCSV = `COPY features FROM '${featurePath}' WITH DELIMITER ',' CSV header`;
  const copied = await client.query(copyFeatCSV)
    .then(data => {console.log('Successful copy from features.csv...', data)})
    .catch(err => {console.log('Unsuccessful copy from features.csv...', err)});

  await client.end();
})();

// --------------- Seeding the products data ----------------------
(async () => {
  const client = await getClient();
  let schema = 'id INT PRIMARY KEY, name VARCHAR, slogan VARCHAR, description VARCHAR, category VARCHAR, default_price VARCHAR';
  let createTableQuery = `
    CREATE TABLE IF NOT EXISTS product (
      ${schema}
    );`;

  const res = await client.query(createTableQuery)
    .then((data) => {console.log(data)})
    .catch((err) => {console.log(err)});

  let productPath = '/home/toekneedeez/hackreactor/system-design-capstone/csv/product.csv';
  let copyProdCSV = `COPY product FROM '${productPath}' WITH DELIMITER ',' CSV header`;
  const copied = await client.query(copyProdCSV)
    .then(data => {console.log('Successful copy from product.csv...', data)})
    .catch(err => {console.log('Unsuccessful copy from product.csv...', err)});



  await client.end();
})();

// --------------- Seeding the related products data ----------------------
(async () => {
  const client = await getClient();
  let schema = 'id INT PRIMARY KEY, current_product_id INT, related_product_id INT';
  let createTableQuery = `
    CREATE TABLE IF NOT EXISTS related (
      ${schema} )
    ;`;

  const res = await client.query(createTableQuery)
    .then((data) => {console.log(data)})
    .catch((err) => {console.log(err)});

  let relatedPath = '/home/toekneedeez/hackreactor/system-design-capstone/csv/related.csv';
  let copyProdCSV = `COPY related FROM '${relatedPath}' WITH DELIMITER ',' CSV header`;
  const copied = await client.query(copyProdCSV)
    .then(data => {console.log('Successful copy from related.csv...', data)})
    .catch(err => {console.log('Unsuccessful copy from related.csv...', err)});

  await client.end();
})();

