// "use strict";
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const https = require('https');

// const privateKey = fs.readFileSync('/etc/letsencrypt/live/vps.isi-net.org/privkey.pem','utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/vps.isi-net.org/cert.pem','utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/vps.isi-net.org/chain.pem','utf8');

// const credentials = {
// 	key: privateKey,
// 	cert: certificate,
//   ca: ca
// };

const api = express();
api.use(bodyParser.urlencoded({ extended: false }))
api.use(bodyParser.json())
api.use(cors({
    origin:['http://localhost/3332','*']
}));


const dbase_climate = require('./database_config.js');
dbase_climate.query(`CREATE TABLE IF NOT EXISTS topic1(
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  temperature FLOAT,
  humidity FLOAT,
  rainfall FLOAT,
  direction VARCHAR(255),
  angle FLOAT,
  wind_speed FLOAT)
  `, function(err, result){
    console.log("Database Connected");
  });

dbase_climate.query(`CREATE TABLE IF NOT EXISTS topic2(
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  hum_dht22 FLOAT,
  temp_dht22 FLOAT)
  `, function(err, result){
    console.log("Database Connected");
  });


// API HANLDING
const climate_appRoute = require('./route.js');
api.use('/', cors(), climate_appRoute);

api.use('/', cors(), (req, res) => {
    res.status(404);
    res.send('CONNECTED'); // respond 404 if not available
});  

// Starting both http & https servers
// const httpServer = http.createServer(api);
//const httpsServer = https.createServer(credentials, api);
//const httpsServer = https.createServer(credentials, api);

// httpServer.listen(process.env.API_PORT, () => {
// 	console.log(`HTTP REST-API running on port ${process.env.API_PORT}`);
// });

// httpsServer.listen(process.env.API_PORT, () => {
// 	console.log(`HTTPS REST-API running on port ${process.env.API_PORT}`);
// });
const PORT = process.env.API_PORT;
api.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}.`);
});

let topic = [
  process.env.TOPIC1,
  process.env.TOPIC2,
  // process.env.TOPIC3,
  // process.env.TOPIC4
];

const mqtt_connect = require('./mqtt_config.js')
const {incomingData} = require('./controler_mqtt.js') 
  // Subscribe topic to receive data from raspberryPi
  // Data From Pertanian
//Subscribe topic to receive API request
mqtt_connect.subscribe(topic, (err) => {
  if (!err) {
    console.log("Subscribed to topic : " + topic); 
  } else throw (err);
});

// Handle message from mqtt
mqtt_connect.on("message", incomingData);