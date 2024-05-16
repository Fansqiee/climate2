
const path = require('path');
const moment = require('moment');
const {Pool} = require('pg')
const { off } = require('process');
const { start } = require('repl');
require('dotenv').config()
require('fs');
const dbase_rest= new Pool({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_CLIMATE
})
dbase_rest.connect();
module.exports = {
   // Respond request to give latest 100 data
    
async getDataTopic1(req, res) {
    const data = await dbase_rest.query(`SELECT id,timestamp,temperature,humidity,rainfall,direction,angle,wind_speed FROM topic1 ORDER BY timestamp DESC LIMIT 100`);
  
    if (data.rowCount > 0) {
        const combinedArray = data.rows.map(row => {
            const { timestamp, ...rest } = row;
            return {
                timestamp: moment(timestamp).format("DD-MM-YY HH:mm:ss"),
                ...rest,
            };
        });
  
        res.status(200);
        res.send({
            count: data.rowCount,
            result: combinedArray,
        });
  
        console.log("[REST-API] GET DATA TOPIC 1");
    } else {
        res.status(404).send("No data found");
    }
    },
async getDataTopic2(req, res) {
           const data = await dbase_rest.query(`SELECT id,timestamp,hum_dht22,temp_dht22 FROM topic2 ORDER BY timestamp DESC LIMIT 100`);
            
           if (data.rowCount > 0) {
            const combinedArray = data.rows.map(row => {
                const { timestamp, ...rest } = row;
                return {
                    timestamp: moment(timestamp).format("DD-MM-YY HH:mm:ss"),
                    ...rest,
                };
            });
      
            res.status(200);
            res.send({
                count: data.rowCount,
                result: combinedArray,
            });
      
            console.log("[REST-API] GET DATA TOPIC 2");
        } else {
            res.status(404).send("No data found");
        }
    },
async TableDataTopic1(req, res) {
      const data = await dbase_rest.query(`SELECT id,timestamp,temperature,humidity,rainfall,direction,angle,wind_speed FROM topic1 ORDER BY timestamp DESC LIMIT 100`);
    
      if (data.rowCount > 0) {
          const combinedArray = data.rows.map(row => {
              const { timestamp, ...rest } = row;
              return {
                  timestamp: moment(timestamp).format("DD-MM-YY HH:mm:ss"),
                  ...rest,
              };
          });
    
          res.status(200);
          res.send({
              count: data.rowCount,
              result: combinedArray,
          });
    
          console.log("[REST-API] GET DATA TOPIC 1");
      } else {
          res.status(404).send("No data found");
      }
      },
async TableDataTopic2(req, res) {
             const data = await dbase_rest.query(`SELECT timestamp,hum_dht22,temp_dht22 FROM topic2 ORDER BY timestamp DESC LIMIT 100`);
              
             if (data.rowCount > 0) {
              const combinedArray = data.rows.map(row => {
                  const { timestamp, ...rest } = row;
                  return {
                      timestamp: moment(timestamp).format("DD-MM-YY HH:mm:ss"),
                      ...rest,
                  };
              });
        
              res.status(200);
              res.send({
                  count: data.rowCount,
                  result: combinedArray,
              });
        
              console.log("[REST-API] GET DATA TOPIC 2");
          } else {
              res.status(404).send("No data found");
          }
      },

async getDataForOneDayTopic1(req, res) {
        // Mendapatkan tanggal saat ini
        const currentDate = moment().format('YYYY-MM-DD');
    
        try {
            const data = await dbase_rest.query(`
                SELECT timestamp,temperature,humidity,rainfall,direction,angle,wind_speed
                FROM topic1 
                WHERE timestamp::date = $1 
                ORDER BY timestamp DESC
            `, [currentDate]);
    
            if (data.rowCount > 0) {
                const combinedArray = data.rows.map(row => {
                    const { timestamp, ...rest } = row;
                    return {
                        timestamp: moment(timestamp).format("DD-MM-YY HH:mm:ss"),
                        ...rest,
                    };
                });
    
                res.status(200).json({
                    count: data.rowCount,
                    result: combinedArray,
                });
    
                console.log(`[REST-API] GET DATA TOPIC 1 for ${currentDate}`);
            } else {
                res.status(404).json({ message: "No data found for today" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
async getDataForOneDayTopic2(req, res) {
      // Mendapatkan tanggal saat ini
      const currentDate = moment().format('YYYY-MM-DD');
  
      try {
          const data = await dbase_rest.query(`
              SELECT timestamp,hum_dht22,temp_dht22 
              FROM topic2
              WHERE timestamp::date = $1 
              ORDER BY timestamp DESC
          `, [currentDate]);
  
          if (data.rowCount > 0) {
              const combinedArray = data.rows.map(row => {
                  const { timestamp, ...rest } = row;
                  return {
                      timestamp: moment(timestamp).format("DD-MM-YY HH:mm:ss"),
                      ...rest,
                  };
              });
  
              res.status(200).json({
                  count: data.rowCount,
                  result: combinedArray,
              });
  
              console.log(`[REST-API] GET DATA TOPIC 2 for ${currentDate}`);
          } else {
              res.status(404).json({ message: "No data found for today" });
          }
      } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
      }
  },

async getDataForSevenDaysTopic1(req, res) {
  try {
      // Mendapatkan tanggal saat ini
      const currentDate = moment().format('YYYY-MM-DD');
      
      // Menghitung tanggal 7 hari yang lalu
      const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');

      const data = await dbase_rest.query(`
          SELECT timestamp,temperature,humidity,rainfall,direction,angle,wind_speed
          FROM topic1 
          WHERE timestamp::date BETWEEN $1 AND $2
          ORDER BY timestamp DESC
      `, [sevenDaysAgo, currentDate]);

      if (data.rowCount > 0) {
          const combinedArray = data.rows.map(row => {
              const { timestamp, ...rest } = row;
              return {
                  timestamp: moment(timestamp).format("DD-MM-YY HH:mm:ss"),
                  ...rest,
              };
          });

          res.status(200).json({
              count: data.rowCount,
              result: combinedArray,
          });

          console.log(`[REST-API] GET DATA TOPIC 1 for the last 7 days`);
      } else {
          res.status(404).json({ message: "No data found for the last 7 days" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
},
async getDataForSevenDaysTopic2(req, res) {
  try {
      // Mendapatkan tanggal saat ini
      const currentDate = moment().format('YYYY-MM-DD');
      
      // Menghitung tanggal 7 hari yang lalu
      const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');

      const data = await dbase_rest.query(`
          SELECT timestamp,hum_dht22,temp_dht22 
          FROM topic2
          WHERE timestamp::date BETWEEN $1 AND $2
          ORDER BY timestamp DESC
      `, [sevenDaysAgo, currentDate]);

      if (data.rowCount > 0) {
          const combinedArray = data.rows.map(row => {
              const { timestamp, ...rest } = row;
              return {
                  timestamp: moment(timestamp).format("DD-MM-YY HH:mm:ss"),
                  ...rest,
              };
          });

          res.status(200).json({
              count: data.rowCount,
              result: combinedArray,
          });

          console.log(`[REST-API] GET DATA TOPIC 2 for the last 7 days`);
      } else {
          res.status(404).json({ message: "No data found for the last 7 days" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
},
async getDataForonemonthTopic1(req, res) {
  try {
      // Mendapatkan tanggal saat ini
      const currentDate = moment().format('YYYY-MM-DD');
      
      // Menghitung tanggal 7 hari yang lalu
      const onemonthago = moment().subtract(30, 'days').format('YYYY-MM-DD');

      const data = await dbase_rest.query(`
          SELECT timestamp,temperature,humidity,rainfall,direction,angle,wind_speed
          FROM topic1 
          WHERE timestamp::date BETWEEN $1 AND $2
          ORDER BY timestamp DESC
      `, [onemonthago, currentDate]);

      if (data.rowCount > 0) {
          const combinedArray = data.rows.map(row => {
              const { timestamp, ...rest } = row;
              return {
                  timestamp: moment(timestamp).format("DD-MM-YY HH:mm:ss"),
                  ...rest,
              };
          });

          res.status(200).json({
              count: data.rowCount,
              result: combinedArray,
          });

          console.log(`[REST-API] GET DATA TOPIC 1 for the last 30 days`);
      } else {
          res.status(404).json({ message: "No data found for the last 7 days" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
},
async getDataForonemonthTopic2(req, res) {
  try {
      // Mendapatkan tanggal saat ini
      const currentDate = moment().format('YYYY-MM-DD');
      
      // Menghitung tanggal 30 hari yang lalu
      const onemonthago = moment().subtract(30, 'days').format('YYYY-MM-DD');

      const data = await dbase_rest.query(`
          SELECT timestamp,hum_dht22,temp_dht22
          FROM topic2
          WHERE timestamp::date BETWEEN $1 AND $2
          ORDER BY timestamp DESC
      `, [onemonthago, currentDate]);

      if (data.rowCount > 0) {
          const combinedArray = data.rows.map(row => {
              const { timestamp, ...rest } = row;
              return {
                  timestamp: moment(timestamp).format("DD-MM-YY HH:mm:ss"),
                  ...rest,
              };
          });

          res.status(200).json({
              count: data.rowCount,
              result: combinedArray,
          });

          console.log(`[REST-API] GET DATA TOPIC 2 for the last 30 days`);
      } else {
          res.status(404).json({ message: "No data found for the last 30 days" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
},
}


