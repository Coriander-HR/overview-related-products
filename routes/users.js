var express = require('express');
var router = express.Router();
const { getClient } = require('../database/connect.js');

/* GET product listing. */
router.get('/', function(req, res, next) {
  console.log('see the get request for products...');
  let recordLimit = req.query.count || 5;
  let pageLimit = req.query.page || 1;

  (async () => {
    const client = await getClient();

    let query = `
    SELECT *
    FROM product
    LIMIT ${recordLimit};`

    await client.query(query)
      .then((data) => {res.send(data.rows)})
      .catch((err) => {console.log(err)});

    await client.end();
  })();
});

/* GET product information. */
router.get('/:product_id', function(req, res, next) {

  (async () => {
    const client = await getClient();

    let query = `
    SELECT product.id, product.name, product.slogan, product.description, product.category, product.default_price, features_mod.features
    FROM product
    JOIN (
      SELECT json_agg(json_build_object('feature',features.feature,'value', features.value)) AS features, features.product_id
      FROM features
      GROUP BY features.product_id
      ) AS features_mod
    ON features_mod.product_id = product.id
    WHERE product.id = ${req.params.product_id};`

    await client.query(query)
      .then((data) => {res.send(data.rows[0])})
      .catch((err) => {console.log(err)});

    await client.end();
  })();
});

/* GET product styles listing. */
router.get('/:product_id/styles', function(req, res, next) {
  console.log('see the get request...',req.params.product_id);
  let recordLimit = req.query.count || 5;

  (async () => {
    const client = await getClient();
    //Retrieves all records of skus related to a styleId
    let stylesQuery = `
    SELECT photos_style.photos, photos_style.styleId AS style_id, photos_skus.skus, photos_style.name, photos_style.default_style AS "default?", photos_style.original_price, photos_style.sale_price
    FROM (
    SELECT photos.styleId, json_agg((json_build_object('url', photos.url, 'thumbnail', photos.thumbnail_url))) AS photos, styles.name, styles.default_style, styles.original_price, styles.sale_price
    FROM photos, styles
    WHERE styles.product_id = ${req.params.product_id} AND styles.id = photos.styleId
      GROUP BY photos.styleId, styles.name, styles.default_style, styles.original_price, styles.sale_price
    ) AS photos_style
    JOIN (
    SELECT skus.styleId, json_object_agg(skus.id, json_build_object('quantity', skus.quantity, 'size', skus.size)) AS skus
    FROM skus, styles
    WHERE styles.product_id = ${req.params.product_id} AND styles.id = skus.styleId
      GROUP BY skus.styleId
    ) AS photos_skus
    ON photos_skus.styleId = photos_style.styleId;`;


    await client.query(stylesQuery)
      .then((data) => {console.log('queried table', data.rows); res.send({product_id: req.params.product_id, results: data.rows})})
      .catch((err) => {console.log(err); res.send(err)});

    await client.end();
  })();
});

/* GET related product listing. */
router.get('/:product_id/related', function(req, res, next) {
  console.log('see the get request...',req.params.product_id);

  (async () => {
    const client = await getClient();
    //Retrieves all records of skus related to a styleId
    let relatedQuery = `
    SELECT array_agg(related.related_product_id) AS related
    FROM related
    WHERE related.current_product_id = ${req.params.product_id}
    GROUP BY related.current_product_id;`;


    await client.query(relatedQuery)
      .then((data) => {console.log('queried table', data.rows[0].related); res.send(data.rows[0].related)})
      .catch((err) => {console.log(err)});

    await client.end();
  })();
});


module.exports = router;



// ---- First draft
// SELECT styles.id, styles.name, styles.original_price, styles.sale_price, styles.default_style AS "default?", array_agg((skus_mod.id, skus_mod.fuk)) AS assfuk
// FROM styles
// JOIN ( -- aggragate size and quantity from the skus table by sku's id while exposing the styleId for joining
// 	SELECT skus.id, skus.styleId, array_agg((skus.size, skus.quantity)) AS fuk
// 	FROM skus
// 	GROUP BY skus.id
// 	LIMIT 50
// ) skus_mod ON skus_mod.styleId = styles.id
// GROUP BY styles.id;

// ---- Final draft

// SELECT styles.id, styles.name, styles.original_price, styles.sale_price, styles.default_style AS "default?", array_agg((skus_mod.id, skus_mod.fuk)) AS assfuk, array_agg(skus_mod.suk) AS photos
// FROM styles
// JOIN ( -- aggragate size and quantity from the skus table by sku's id while exposing the styleId for joining
// 	SELECT skus.id, skus.styleId, skus.fuk, photos.suk
// 	FROM
// 	(SELECT skus.id, skus.styleId, array_agg((skus.size, skus.quantity)) AS fuk
// 	FROM skus
// 	GROUP BY skus.id
// 	LIMIT 50) AS skus
// 	JOIN
// 	(SELECT photos.id, photos.styleId, array_agg((photos.url, photos.thumbnail_url)) AS suk
// 	FROM photos
// 	GROUP BY photos.id
// 	LIMIT 50) AS photos
// 	ON skus.styleId = photos.styleId
// ) skus_mod ON skus_mod.styleId = styles.id
// GROUP BY styles.id;

// ------- Revision Draft
// SELECT styles.id, styles.name, styles.original_price, styles.sale_price, styles.default_style AS "default?", array_agg((skus_mod.id, skus_mod.skus)) AS skus, array_agg(skus_mod.photos) AS photos
// FROM styles
// JOIN ( -- aggragate size and quantity from the skus table by sku's id while exposing the styleId for joining
// 	SELECT skus.id, skus.styleId, skus.skus, photos.photos
// 	FROM
// 	(SELECT skus.id, skus.styleId, array_agg((skus.size, skus.quantity)) AS skus
// 	FROM skus
// 	GROUP BY skus.id
// 	LIMIT 50) AS skus
// 	JOIN
// 	(SELECT photos.id, photos.styleId, array_agg((photos.url, photos.thumbnail_url)) AS photos
// 	FROM photos
// 	GROUP BY photos.id
// 	LIMIT 50) AS photos
// 	ON skus.styleId = photos.styleId
// ) skus_mod ON skus_mod.styleId = styles.id
// GROUP BY styles.id;

//--- Revision -----
// SELECT styles.product_id, styles.id AS styleId, styles.name, styles.original_price, styles.sale_price, styles.default_style AS "default?", array_agg((skus_mod.skusId, skus_mod.skus)) AS skus, array_agg(skus_mod.photos) AS photos
// 	FROM styles
// 	JOIN ( -- aggragate size and quantity from the skus table by sku's id while exposing the styleId for joining

// 		SELECT photos_mod.skusId, photos_mod.styleId, array_agg(DISTINCT photos_mod.skus) AS skus, array_agg(DISTINCT photos_mod.photos) AS photos
// 		FROM (
// 			SELECT skus.skusId, skus.styleId, skus.skus, photos_mod.photos
// 			FROM
// 			(
// 				SELECT skus.id AS skusId, skus.styleId, array_agg((skus.size, skus.quantity)) AS skus
// 				FROM skus
// 				GROUP BY skus.id
// 				LIMIT 50
// 			) AS skus
// 			JOIN ( -- aggragate the url and thumbnail_url from photos table by photo's id while exposing the styleId for joining
// 				SELECT photos.id, photos.styleId, array_agg((photos.url, photos.thumbnail_url)) AS photos
// 				FROM photos
// 				GROUP BY photos.id
// 				LIMIT 50
// 			) AS photos_mod
// 			ON skus.styleId = photos_mod.styleId
// 		) AS photos_mod
// 		GROUP BY photos_mod.styleId, photos_mod.skusId

// 	) AS skus_mod
//  	ON skus_mod.styleId = styles.id
// 	GROUP BY styles.id


//--- Revision ----
// SELECT styles_mod.product_id, styles_mod.styleId, styles_mod.name, styles_mod.original_price, styles_mod.sale_price, 'default?'
// FROM (
// 	SELECT styles.product_id, styles.id AS styleId, styles.name, styles.original_price, styles.sale_price, styles.default_style AS "default?", array_agg((skus_mod.skusId, skus_mod.skus)) AS skus, array_agg(skus_mod.photos) AS photos
// 	FROM styles
// 	JOIN ( -- aggragate size and quantity from the skus table by sku's id while exposing the styleId for joining
// 		SELECT photos_mod.skusId, photos_mod.styleId, array_agg(DISTINCT photos_mod.skus) AS skus, array_agg(DISTINCT photos_mod.photos) AS photos
// 		FROM (
// 			SELECT skus.skusId, skus.styleId, skus.skus, photos_mod.photos
// 			FROM
// 			(
// 				SELECT skus.id AS skusId, skus.styleId, array_agg((skus.size, skus.quantity)) AS skus
// 				FROM skus
// 				GROUP BY skus.id
// -- 				LIMIT 1000
// 			) AS skus
// 			JOIN ( -- aggragate the url and thumbnail_url from photos table by photo's id while exposing the styleId for joining
// 				SELECT photos.id, photos.styleId, array_agg((photos.url, photos.thumbnail_url)) AS photos
// 				FROM photos
// 				GROUP BY photos.id
// -- 				LIMIT 1000
// 			) AS photos_mod
// 			ON skus.styleId = photos_mod.styleId
// 		) AS photos_mod
// 		GROUP BY photos_mod.styleId, photos_mod.skusId
// 	) AS skus_mod
//  	ON skus_mod.styleId = styles.id
// 	GROUP BY styles.id
// ) AS styles_mod
// WHERE styles_mod.product_id = 37311;



// SELECT styles_mod.product_id, styles_mod.styleId, styles_mod.name, styles_mod.original_price, styles_mod.sale_price, styles_mod.default_style AS "default?", styles_mod.skus, styles_mod.photos
// FROM (
// 	SELECT styles.product_id, styles.id AS styleId, styles.name, styles.original_price, styles.sale_price, styles.default_style, array_agg((skus_mod.skusId, skus_mod.skus)) AS skus, array_agg(skus_mod.photos) AS photos
// 	FROM styles
// 	JOIN ( -- aggragate size and quantity from the skus table by sku's id while exposing the styleId for joining
// 		SELECT photos_mod.skusId, photos_mod.styleId, array_agg(DISTINCT photos_mod.skus) AS skus, array_agg(DISTINCT photos_mod.photos) AS photos
// 		FROM (
// 			SELECT skus.skusId, skus.styleId, skus.skus, photos_mod.photos
// 			FROM
// 			(
// 				SELECT skus.id AS skusId, skus.styleId, array_agg((skus.size, skus.quantity)) AS skus
// 				FROM skus
// 				GROUP BY skus.id
// --  				LIMIT 1000
// 			) AS skus
// 			JOIN ( -- aggragate the url and thumbnail_url from photos table by photo's id while exposing the styleId for joining
// 				SELECT photos.id, photos.styleId, array_agg((photos.url, photos.thumbnail_url)) AS photos
// 				FROM photos
// 				GROUP BY photos.id
// --  				LIMIT 1000
// 			) AS photos_mod
// 			ON skus.styleId = photos_mod.styleId
// 		) AS photos_mod
// 		GROUP BY photos_mod.styleId, photos_mod.skusId
// 	) AS skus_mod
//  	ON skus_mod.styleId = styles.id
// 	GROUP BY styles.id
// ) AS styles_mod
// WHERE styles_mod.product_id = 1;


// select styles.product_id, json_agg(json_build_object('style_id', styles.id, 'name', styles.name, 'sales_price', styles.sale_price, 'original_price', styles.original_price, 'default?', styles.default_style, 'photos', (json_agg(json_build_object('url', photos_mod.url, 'thumbnail_url', photos_mod.thumbnail_url))), 'skus', (json_build_object(photos_mod.skusId, json_build_object('size', photos_mod.size, 'quantity', photos_mod.quantity)))))
// from styles
// join (
// 	select photos.url, photos.thumbnail_url, photos.styleId, skus_mod.size, skus_mod.quantity, skus_mod.skusId
// 	from photos
// 	join (
// 		select skus.size, skus.quantity, skus.styleId, skus.id as skusId
// 		from skus
// 	) as skus_mod
// 	on skus_mod.styleId = photos.styleId
// 	) AS photos_mod
// on photos_mod.styleId = styles.id
// where styles.product_id = 3
// GROUP BY styles.product_id;


// select styles.id AS stylesId, styles.product_id, styles.name, styles.sale_price, styles.original_price, styles.default_style AS "default?", json_build_object('url', photos_mod.url, 'thumbnail_url', photos_mod.thumbnail_url) AS photos, json_build_object(photos_mod.skusId, json_build_object('size', photos_mod.size, 'quantity', photos_mod.quantity)) AS skus
//     from styles
//     join (
//       select photos.url, photos.thumbnail_url, photos.styleId, skus_mod.size, skus_mod.quantity, skus_mod.id AS skusId
//       from photos
//       join (
//         select skus.size, skus.quantity, skus.styleId, skus.id
//         from skus
//       ) as skus_mod
//       on skus_mod.styleId = photos.styleId
//       ) AS photos_mod
//     on photos_mod.styleId = styles.id
//     where styles.product_id = 1;





// SELECT json_agg(DISTINCT to_jsonb(styles_mod.*)) AS results, styles_mod.stylesId
// FROM (

// 	select styles.id AS stylesId, styles.product_id, styles.name, styles.sale_price, styles.original_price, styles.default_style AS "default?", json_build_object('url', photos_mod.url, 'thumbnail_url', photos_mod.thumbnail_url) AS photos, json_build_object(photos_mod.skusId, json_build_object('size', photos_mod.size, 'quantity', photos_mod.quantity)) AS skus
// 	from styles
// 	join (

// 		  select photos.url, photos.thumbnail_url, photos.styleId, skus_mod.size, skus_mod.quantity, skus_mod.id AS skusId
// 		  from photos
// 		  join (
// 				select skus.size, skus.quantity, skus.styleId, skus.id
// 				from skus
// 		  ) as skus_mod
// 		  on skus_mod.styleId = photos.styleId

// 	) AS photos_mod
// 	on photos_mod.styleId = styles.id
// 	where styles.product_id = 1
// ) AS styles_mod

// GROUP BY styles_mod.stylesId



// SELECT json_agg(DISTINCT to_jsonb(styles_mod.*)) AS results
// FROM (

// 	select styles.id AS stylesId, styles.product_id, styles.name, styles.sale_price, styles.original_price, styles.default_style AS "default?", json_build_object('url', photos_mod.url, 'thumbnail_url', photos_mod.thumbnail_url) AS photos, json_build_object(photos_mod.skusId, json_build_object('size', photos_mod.size, 'quantity', photos_mod.quantity)) AS skus
// 	from styles
// 	join (

// 		  select photos.url, photos.thumbnail_url, photos.styleId, skus_mod.size, skus_mod.quantity, skus_mod.id AS skusId
// 		  from photos
// 		  join (
// 				select skus.size, skus.quantity, skus.styleId, skus.id
// 				from skus
// 		  ) as skus_mod
// 		  on skus_mod.styleId = photos.styleId

// 	) AS photos_mod
// 	on photos_mod.styleId = styles.id
// 	where styles.product_id = 1
// ) AS styles_mod

// GROUP BY styles_mod.skus;


// select jsonb_agg(distinct jsonb_build_object('url', photos.url, 'thumbnail_url', photos.thumbnail_url)), photos.styleId, jsonb_agg( distinct jsonb_build_object(skus_mod.id, jsonb_build_object('size', skus_mod.size, 'quantity',skus_mod.quantity)))
// from photos
// join (
//   select skus.size, skus.quantity, skus.styleId, skus.id
//   from skus
// ) as skus_mod
// on skus_mod.styleId = photos.styleId
// GROUP BY photos.styleId


// select jsonb_agg(distinct to_jsonb((styles.*, photos_mod.*)))
// from styles
// join (
// 		  select jsonb_agg(distinct jsonb_build_object('url', photos.url, 'thumbnail_url', photos.thumbnail_url)), photos.styleId, jsonb_agg( distinct jsonb_build_object(skus_mod.id, jsonb_build_object('size', skus_mod.size, 'quantity',skus_mod.quantity)))
// 		  from photos
// 		  join (
// 				select skus.size, skus.quantity, skus.styleId, skus.id
// 				from skus
// 		  ) as skus_mod
// 		  on skus_mod.styleId = photos.styleId
// 	WHERE skus_mod.styleId = 1
// 		  GROUP BY photos.styleId

// ) AS photos_mod
// on photos_mod.styleId = styles.id
// where styles.product_id = 1



// select DISTINCT to_jsonb(photos_mod.*)--styles.id, styles.name, styles.original_price, styles.sale_price, styles.default_style, photos_mod.url
// from styles
// join (

// 	  select DISTINCT photos.url, photos.thumbnail_url, photos.styleId, skus_mod.id as skusId, skus_mod.size, skus_mod.quantity
// 	  from photos
// 	  join (
// 			select DISTINCT skus.size, skus.quantity, skus.styleId, skus.id
// 			from skus
// 	  ) as skus_mod
// 	  on skus_mod.styleId = photos.styleId
// -- WHERE skus_mod.styleId = 1

// ) AS photos_mod
// on photos_mod.styleId = styles.id
// where styles.product_id = 1
// GROUP BY styles.id



// SELECT photos_style.photos, photos_style.styleId, photos_skus.skus, photos_style.name, photos_style.default_style AS "default?", photos_style.original_price, photos_style.sale_price
// FROM (
//  SELECT photos.styleId, json_agg((json_build_object('url', photos.url, 'thumbnail', photos.thumbnail_url))) AS photos, styles.name, styles.default_style, styles.original_price, styles.sale_price
//  FROM photos, styles
//  WHERE styles.product_id = 1 AND styles.id = photos.styleId
// 	GROUP BY photos.styleId, styles.name, styles.default_style, styles.original_price, styles.sale_price
// ) AS photos_style
// JOIN (
//  SELECT skus.styleId, json_object_agg(skus.id, json_build_object('quantity', skus.quantity, 'size', skus.size)) AS skus
//  FROM skus, styles
//  WHERE styles.product_id = 1 AND styles.id = skus.styleId
// 	GROUP BY skus.styleId
// ) AS photos_skus
// ON photos_skus.styleId = photos_style.styleId


