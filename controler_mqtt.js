const dbase_mqtt = require('./database_config.js');
const mqtt_connect = require('./mqtt_config.js');

require('dotenv').config()

TOPIC_CLIMATE1 = process.env.TOPIC1;
TOPIC_CLIMATE2 = process.env.TOPIC2;
// // TOPIC_PERTANIAN3 = process.env.TOPIC3;
// TOPIC_PERTANIAN4 = process.env.TOPIC4;

timestamp1_PATH = process.env.PAYLOAD_CLIMATE1_timestamp
temperature_PATH = process.env.PAYLOAD_CLIMATE1_temperature
humidity_PATH = process.env.PAYLOAD_CLIMATE1_humidity
rainfall_PATH = process.env.PAYLOAD_CLIMATE1_rainfall
direction_PATH = process.env.PAYLOAD_CLIMATE1_direction
angle_PATH = process.env.PAYLOAD_CLIMATE1_angle
wind_speed_PATH = process.env.PAYLOAD_CLIMATE1_wind_speed

timestamp2_PATH = process.env.PAYLOAD_CLIMATE2_timestamp
hum_dht22_PATH = process.env.PAYLOAD_CLIMATE2_hum_dht22
temp_dht22_PATH = process.env.PAYLOAD_CLIMATE2_temp_dht22



module.exports = {
    // MQTT HANDLING
    async incomingData(topic,message){
        
        //sub to topic 1
        if (topic === TOPIC_CLIMATE1){
            const payload = JSON.parse(message, toString());
            
            timestamp1 = (payload[timestamp1_PATH]);
            temperature = (payload[temperature_PATH]);
            humidity = (payload[humidity_PATH]);
            rainfall = (payload[rainfall_PATH]);
            direction = (payload[direction_PATH]);
            angle = (payload[angle_PATH]);
            wind_speed = (payload[wind_speed_PATH]);
            
            let dataArray = [timestamp1,temperature,humidity,rainfall,direction,angle,wind_speed];
        
            console.log(`data topic 1 received `);
            console.log(dataArray);
            const insertQuery = `INSERT INTO topic1 (timestamp,temperature,humidity,rainfall,direction,angle,wind_speed) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
            
            dbase_mqtt.query(insertQuery, dataArray, (err, res) => {
                if (err) {
                    console.error('Error inserting data into the database:', err);
                } else {
        
                console.log("______________________________________");
                console.log("DATA INSERTED TO DATABASE:");
                console.log(`Timestamp: ${timestamp1}`);
                console.log(`PH: ${temperature}`);
                console.log(`TDS: ${humidity}`);
                console.log(`Suhu Air: ${rainfall}`);
                console.log(`Wind Direction: ${direction}`);
                console.log(`Kecepatan Angin: ${angle}`);
                console.log(`Infrared 1: ${wind_speed}`);
                console.log("______________________________________");
                }
            });
        }
        
        //sub to topic2
        else if (topic === TOPIC_CLIMATE2){
                const payload = JSON.parse(message, toString());

                timestamp2 = (payload[timestamp2_PATH]);
                hum_dht22 = (payload[hum_dht22_PATH]);
                temp_dht22 = (payload[temp_dht22_PATH]);

                let dataArray2 = [timestamp2,hum_dht22,temp_dht22];

                console.log(`data topic 2 received `);
                console.log(dataArray2);
                const insertQuery = `INSERT INTO topic2 (timestamp,hum_dht22,temp_dht22) VALUES ($1, $2, $3)`;
            
                dbase_mqtt.query(insertQuery, dataArray2, (err, res) => {
                    if (err) {
                        console.error('Error inserting data into the database:', err);
                    } else {

                        console.log("______________________________________");
                        console.log("DATA INSERTED TO DATABASE:");
                        console.log(`Timestamp: ${timestamp2}`);
                        console.log(`Waterflow 1: ${hum_dht22}`);
                        console.log(`Waterflow 2: ${temp_dht22}`);
                        console.log("______________________________________");
                    }
            });
        }
    }
}     


    
