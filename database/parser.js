const fs = require('fs');
const readline = require('readline');
const { parse } = require('fast-csv');
const { format } = require('@fast-csv/format');

//I have the option to read the entire csv file as a string or line-by-line
  //I think line by line is better so i can add the associated foreign key
const skuPath = '/home/toekneedeez/hackreactor/system-design-capstone/csv/skus.csv';
const testPath = '/home/toekneedeez/hackreactor/system-design-capstone/csv/test.csv';
const input = fs.createReadStream(skuPath);
// const rl = readline.createInterface({input});
const output = fs.createWriteStream(testPath);

let data = [];
const stream = format({ delimiter: ','});
stream.pipe(output);
let stopped = false;
let once = false;
(async () => {
  console.log('reading csv...')
  await input
  .pipe(parse({headers: true}))
  .on('error', err => console.log(err))
  .on('data', row => {
    if (data.length < 100) {
      data.push(row);
      stream.write(row);
    } else {
      input.pause();
      data = [];
    }
  })
  .on('end', rowCount => {
    stream.end();
    console.log('ended with data...', data);
  })
})();

// Product Styles Results SKUS Schema:
// id: INT, PRIMARY KEY
// styleId: Int, FOREIGN KEY
// size: String,
// quantity: Int,