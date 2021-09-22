const express = require('express');
const cors = require('cors');
const CronJob = require('cron').CronJob;
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PORT = process.env.PORT || 8080;

const app = express();

global.dataGlobal = {};
global.arrayNews = [];

app.use(cors());

const getIds = async () => {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const data = await response.json();
    dataGlobal = data;
    getInfo(dataGlobal);
}

const getInfo = async (dataGlobal) => {
    arrayNews = [];
    dataGlobal.slice(0, 500).map(item => { 
        fetch(`https://hacker-news.firebaseio.com/v0/item/${item}.json?print=pretty`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                arrayNews.push(data);                
            })
    });
    console.log('Api loaded info !!!');

};

//cron job to update the api

const job = new CronJob("5 */3 * * *", () => {                         
    let date =  new Date();
    let time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    console.log(`initial cron job at: ${time}`);
    try{
        getIds();
    }catch(err){
        console.log(err);
    }
}, null, true, "America/Bogota");
job.start();

app.get('/api/v0/all-news', (req, res) => {
   
    res.send({data: arrayNews});
});

app.listen(PORT, () => {
    console.log('server running in port: ', PORT);
});