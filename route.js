const router = require('express').Router();
const pertanian_http = require('./controler_http.js');

router.get('/getDataTopic1', pertanian_http.getDataTopic1);
router.get('/getDataTopic2', pertanian_http.getDataTopic2);

//datafortable
router.get('/TableDataTopic1', pertanian_http.TableDataTopic1);
router.get('/TableDataTopic2', pertanian_http.TableDataTopic2);

//getforoneday
router.get('/getDataForOneDayTopic1', pertanian_http.getDataForOneDayTopic1);
router.get('/getDataForOneDayTopic2', pertanian_http.getDataForOneDayTopic2);

//getdatasevendays
router.get('/getDataForSevenDaysTopic1', pertanian_http.getDataForSevenDaysTopic1);
router.get('/getDataForSevenDaysTopic2', pertanian_http.getDataForSevenDaysTopic2);

//getdataforonemonth
router.get('/getDataForonemonthTopic1', pertanian_http.getDataForonemonthTopic1);
router.get('/getDataForonemonthTopic2', pertanian_http.getDataForonemonthTopic2);



// //getalldata
// router.get('/get100data', pertanian_http.get100data);
// // getdatafortable
// router.get('/get100datatable', pertanian_http.get100datatable);
// // getdailydata
// router.get('/getDataForOneDay', pertanian_http.getDataForOneDay);
// router.get('/getDailyAverages', pertanian_http.getDailyAverages);
// // getweeklydata
// router.get('/getDataForSevenDays', pertanian_http.getDataForSevenDays);
// router.get('/getWeeklyAverages', pertanian_http.getWeeklyAverages);
// // getmonthlydata
// router.get('/getDataForonemonth', pertanian_http.getDataForonemonth);
// router.get('/getMonthlyAverages', pertanian_http.getMonthlyAverages);
// // download data
// router.get('/download100latestdata', pertanian_http.download100latestdata);
// router.get('/downloaddailydata', pertanian_http.downloaddailydata);
// router.get('/downloadweeklydata', pertanian_http.downloadweeklydata);
// router.get('/downloadmonthlydata', pertanian_http.downloadmonthlydata);

module.exports = router;