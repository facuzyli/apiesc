const mssql = require('mssql');
const knex = require('knex');
const redis = require('redis');

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket:{
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    reconnectStrategy: (attempt) => {
      console.log(`${new Date().toLocaleString()} - Redis try to connect, attempt ${attempt}`);
      return 20000; //reconectando en 20s
    }
  }
});
(async ()=>{
  client.on('error', (err) => {
		console.log(`${new Date().toLocaleString()} - Redis connection error:`, err.message);
  })
  client.on('ready', () => {
		console.log(`${new Date().toLocaleString()} - Redis connection ready`);
  })
  await client.connect()
})();
const getRedis = async () => {
  if(client.isReady) return client;
  else return false;
}

const sqlConfig = {
  user: process.env.USER_DB,
  password: process.env.PWD_DB,
  database: process.env.DATABASE,
  server: process.env.SERVER,
  options: {
    trustServerCertificate: true,
    appName: "servicio-api-pos"
  }
}

const pool = new mssql.ConnectionPool(sqlConfig);
const db = pool.connect();

const getConn = async () => {
  await db;
  return pool.request();  
}

const getKnex = async () => {
  return knex({
    client: 'mssql',
    connection: sqlConfig
  });
}


module.exports = {
  sql: mssql,
  getConn,
  getKnex,
  getRedis
};
