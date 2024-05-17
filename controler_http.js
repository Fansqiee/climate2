
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
    const data = await dbase_rest.query(`SELECT id,timestamp,temperature,humidity,rainfall,direction,angle,wind_speed FROM topic1 ORDER BY timestamp DESC LIMIT 1`);
  
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
           const data = await dbase_rest.query(`SELECT id,timestamp,hum_dht22,temp_dht22 FROM topic2 ORDER BY timestamp DESC LIMIT 1`);
            
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
      const data = await dbase_rest.query(`SELECT id,timestamp,temperature,humidity,rainfall,direction,angle,wind_speed FROM topic1 ORDER BY timestamp DESC LIMIT 10`);
    
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
    try {
        const query = `
          WITH interval_data AS (
            SELECT
              date_trunc('minute', timestamp) - ((date_part('minute', timestamp)::int % 5) || ' minutes')::interval AS interval_start,
              timestamp,
              temperature,
              humidity,
              rainfall,
              direction,
              angle,
              wind_speed,
              ROW_NUMBER() OVER (PARTITION BY date_trunc('minute', timestamp) - ((date_part('minute', timestamp)::int % 5) || ' minutes')::interval ORDER BY timestamp DESC) AS rn
            FROM topic1
            WHERE timestamp::date BETWEEN CURRENT_DATE - INTERVAL '5 days' AND CURRENT_DATE
          )
          SELECT
            interval_start,
            temperature,
            humidity,
            rainfall,
            direction,
            angle,
            wind_speed
          FROM interval_data
          WHERE rn = 1
          ORDER BY interval_start DESC
        `;
    
        const data = await dbase_rest.query(query);
    
        if (data.rowCount > 0) {
          const formattedData = data.rows.map(row => {
            const { interval_start, ...rest } = row;
    
            // Batasi nilai numerik menjadi 2 angka desimal
            const roundedValues = Object.fromEntries(
              Object.entries(rest).map(([key, value]) => {
                return [key, typeof value === 'number' ? parseFloat(value.toFixed(2)) : value];
              })
            );
    
            return {
              timestamp: moment(interval_start).format("DD-MM-YY HH:mm:ss"),
              ...roundedValues,
            };
          });
    
          res.status(200).send({
            count: data.rowCount,
            result: formattedData,
          });
    
          console.log("[REST-API] GET WEEKLY LAST DATA PER INTERVAL");
        } else {
          res.status(404).send("No data found in the days");
        }
      } catch (error) {
        console.error("[REST-API] Error fetching weekly last data per interval:", error);
        res.status(500).send("Internal Server Error");
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
      const query = `
        WITH interval_data AS (
          SELECT
            date_trunc('minute', timestamp) - ((date_part('minute', timestamp)::int % 30) || ' minutes')::interval AS interval_start,
            timestamp,
            temperature,
            humidity,
            rainfall,
            direction,
            angle,
            wind_speed,
            ROW_NUMBER() OVER (PARTITION BY date_trunc('minute', timestamp) - ((date_part('minute', timestamp)::int % 30) || ' minutes')::interval ORDER BY timestamp DESC) AS rn
          FROM topic1
          WHERE timestamp::date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE
        )
        SELECT
          interval_start,
          temperature,
          humidity,
          rainfall,
          direction,
          angle,
          wind_speed
        FROM interval_data
        WHERE rn = 1
        ORDER BY interval_start DESC
      `;
  
      const data = await dbase_rest.query(query);
  
      if (data.rowCount > 0) {
        const formattedData = data.rows.map(row => {
          const { interval_start, ...rest } = row;
  
          // Batasi nilai numerik menjadi 2 angka desimal
          const roundedValues = Object.fromEntries(
            Object.entries(rest).map(([key, value]) => {
              return [key, typeof value === 'number' ? parseFloat(value.toFixed(2)) : value];
            })
          );
  
          return {
            timestamp: moment(interval_start).format("DD-MM-YY HH:mm:ss"),
            ...roundedValues,
          };
        });
  
        res.status(200).send({
          count: data.rowCount,
          result: formattedData,
        });
  
        console.log("[REST-API] GET WEEKLY LAST DATA PER INTERVAL");
      } else {
        res.status(404).send("No data found in the last 7 days");
      }
    } catch (error) {
      console.error("[REST-API] Error fetching weekly last data per interval:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  
  
  
  async getDataForSevenDaysTopic2(req, res) {
    try {
      const query = `
        WITH interval_data AS (
          SELECT
            date_trunc('minute', timestamp) - ((date_part('minute', timestamp)::int % 30) || ' minutes')::interval AS interval_start,
            timestamp,
            hum_dht22,
            temp_dht22,
            ROW_NUMBER() OVER (PARTITION BY date_trunc('minute', timestamp) - ((date_part('minute', timestamp)::int % 30) || ' minutes')::interval ORDER BY timestamp DESC) AS rn
          FROM topic2
          WHERE timestamp::date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE
        )
        SELECT
          interval_start,
          hum_dht22,
          temp_dht22
        FROM interval_data
        WHERE rn = 1
        ORDER BY interval_start DESC
      `;
  
      const data = await dbase_rest.query(query);
  
      if (data.rowCount > 0) {
        const formattedData = data.rows.map(row => {
          const { interval_start, ...rest } = row;
  
          // Batasi nilai numerik menjadi 2 angka desimal jika diperlukan
          const roundedValues = Object.fromEntries(
            Object.entries(rest).map(([key, value]) => {
              return [key, typeof value === 'number' ? parseFloat(value.toFixed(2)) : value];
            })
          );
  
          return {
            timestamp: moment(interval_start).format("DD-MM-YY HH:mm:ss"),
            ...roundedValues,
          };
        });
  
        res.status(200).json({
          count: data.rowCount,
          result: formattedData,
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
  
async getDataForOneMonthTopic2(req, res) {
    try {
        const query = `
          WITH interval_data AS (
            SELECT
              date_trunc('minute', timestamp) - ((date_part('minute', timestamp)::int % 60) || ' minutes')::interval AS interval_start,
              timestamp,
              hum_dht22,
              temp_dht22,
              ROW_NUMBER() OVER (PARTITION BY date_trunc('minute', timestamp) - ((date_part('minute', timestamp)::int % 60) || ' minutes')::interval ORDER BY timestamp DESC) AS rn
            FROM topic2
            WHERE timestamp::date BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
          )
          SELECT
            interval_start,
            hum_dht22,
            temp_dht22
          FROM interval_data
          WHERE rn = 1
          ORDER BY interval_start DESC
        `;
    
        const data = await dbase_rest.query(query);
    
        if (data.rowCount > 0) {
          const formattedData = data.rows.map(row => {
            const { interval_start, ...rest } = row;
    
            // Batasi nilai numerik menjadi 2 angka desimal jika diperlukan
            const roundedValues = Object.fromEntries(
              Object.entries(rest).map(([key, value]) => {
                return [key, typeof value === 'number' ? parseFloat(value.toFixed(2)) : value];
              })
            );
    
            return {
              timestamp: moment(interval_start).format("DD-MM-YY HH:mm:ss"),
              ...roundedValues,
            };
          });
    
          res.status(200).json({
            count: data.rowCount,
            result: formattedData,
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
async getDataForOneMonthTopic1(req, res) {
    try {
        const query = `
          WITH interval_data AS (
            SELECT
              date_trunc('minute', timestamp) - ((date_part('minute', timestamp)::int % 60) || ' minutes')::interval AS interval_start,
              timestamp,
              temperature,
              humidity,
              rainfall,
              direction,
              angle,
              wind_speed,
              ROW_NUMBER() OVER (PARTITION BY date_trunc('minute', timestamp) - ((date_part('minute', timestamp)::int % 60) || ' minutes')::interval ORDER BY timestamp DESC) AS rn
            FROM topic1
            WHERE timestamp::date BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
          )
          SELECT
            interval_start,
            temperature,
            humidity,
            rainfall,
            direction,
            angle,
            wind_speed
          FROM interval_data
          WHERE rn = 1
          ORDER BY interval_start DESC
        `;
    
        const data = await dbase_rest.query(query);
    
        if (data.rowCount > 0) {
          const formattedData = data.rows.map(row => {
            const { interval_start, ...rest } = row;
    
            // Batasi nilai numerik menjadi 2 angka desimal
            const roundedValues = Object.fromEntries(
              Object.entries(rest).map(([key, value]) => {
                return [key, typeof value === 'number' ? parseFloat(value.toFixed(2)) : value];
              })
            );
    
            return {
              timestamp: moment(interval_start).format("DD-MM-YY HH:mm:ss"),
              ...roundedValues,
            };
          });
    
          res.status(200).send({
            count: data.rowCount,
            result: formattedData,
          });
    
          console.log("[REST-API] GET WEEKLY LAST DATA PER INTERVAL");
        } else {
          res.status(404).send("No data found in the last 30 days");
        }
      } catch (error) {
        console.error("[REST-API] Error fetching weekly last data per interval:", error);
        res.status(500).send("Internal Server Error");
      }
    },
}


