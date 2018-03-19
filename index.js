const mongoose = require('mongoose');
const User = require('./models/user');
const hours_12 = 43200000;
const url = 'https://duty-telegram-bot-duty-telegram-bot.7e14.starter-us-west-2.openshiftapps.com/';


const TelegramBot = require('node-telegram-bot-api');
const Token = '534477980:AAGmXdQADf4XLTAYJQrnWcP7JulJNH6H-60';
//const bot = new TelegramBot(Token,{polling:true});
const bot = new TelegramBot(Token,{
  webHook:{ 
    port:8080
  }
});

bot.setWebHook(`${url}/${Token}`);
bot.on('webhook_error', (error) => {
  throw error;
});

console.log("Bot running");
connectDatabase();

function connectDatabase() {
 
  mongoose.connect('mongodb://duty:advancE@ds115579.mlab.com:15579/duty');

  const db = mongoose.connection;

  db.on('error', err => {
  console.log('error', err);
  });
  db.once('open', () => {
  console.log('connected to database');
  });
  db.once('close', () => {
    console.log('disconnected to database');
  });
};
 

bot.onText(/\/duty/, (msg) => {

  const chatId = msg.chat.id;
  let dateNow = new Date().getTime();
  
  User.find({}, (err,data) => {
    if (err) throw err;
    
    for (var i = 0; i < data.length; i++) {
      
      if ((dateNow - data[i].date) <= hours_12 && (dateNow - data[i].date) > 0) {
        bot.sendMessage(chatId, "Дежурный:\n" +data[i].name);
       // bot.sendContact(chatId, data[i].phone, data[i].name);
      };    

      if ((dateNow - data[i].date) > hours_12) {

        while ((dateNow - data[i].date) > hours_12) {
        
          switch (data[i].status) {  
            case 'day': 
              data[i].date =  data[i].date + hours_12 * 3;  
              data[i].status = 'night';                      
            break;
        
            case 'night': 
              data[i].date =  data[i].date + hours_12 * 5;  
              data[i].status = 'day';                      
            break;        
          };
        };

        if ((dateNow - data[i].date) <= hours_12 && (dateNow - data[i].date) > 0) {
          bot.sendMessage(chatId, "Дежурный:\n" +data[i].name);
         // bot.sendContact(chatId, data[i].phone, data[i].name);
        };

        User.findByIdAndUpdate(data[i]._id, {date: data[i].date, status: data[i].status}, {new:true}, 
          (err,result) => {   
          if (err) throw err;    
          console.log(result);     
        });          
      };
    };
  });
});

