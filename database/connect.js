const { Client } = require('pg');
require('dotenv').config();

module.exports.getClient = async () => {
  const client = new Client({
    host: process.env.DBSERVERIP,
    port: 5432,
    user: 'ubuntu',
    password: process.env.DBPASS,
    database: "ec2",
    ssl: false
  });
  await client.connect().catch(err => {console.log(err)});
  console.log('hello, connected to PSQL database');
  return client;
};


