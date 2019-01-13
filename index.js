const mongoose = require('mongoose');
const User = require('./models/user');
const mongoUrl = process.env.mongoUrl;
const token = process.env.token;
const hours_12 = 43200000;
const telegramBot = require('node-telegram-bot-api');

const bot = new telegramBot(token, {
  polling : true
});

console.log(process.env.token);
console.log(process.env.mongoUrl);

bot.on('polling_error', (error) => {
  throw error;
});


//Connect to database
function connectDatabase() {
 
  mongoose.connect(mongoUrl);

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
 

connectDatabase();


//Handler for command /start
bot.onText(/\/start/, (msg,match) => { 
  chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
  bot.sendMessage(chat, 'Доступные команды для бота:\n/duty - Покажет кто сейчас дежурный.\n/duty 31.12.2018.23.59 - '+
  'С параметрами даты покажет кто дежурный на указанную дату и время.\nФормат даты DD.MM.YYYY.HH.MI.');        
});



bot.onText(/\/duty/, (msg) => {
  let msgChatId = msg.chat.id;
  let dateNow = new Date().getTime() + 18000000;
  
  if (msg.text == '/duty' || msg.text == '/duty@Duty_admin_bot') {
    updateDate(dateNow,true)
      .then( async (dutys) => {
        if (dutys[1] == holiday.first[1] && dutys[2] == 'дневная') { 
          dutys[1] = holiday.second[1]; 
          dutys[0] = holiday.second[0];          
        };
        if (dutys[1] == holiday.first[1] && dutys[2] == 'ночная') { 
          dutys[1] = holiday.third[1]; 
          dutys[0] = holiday.third[0];
        };
        await bot.sendMessage(msgChatId, "Дежурный " +dutys[1]+ ", смена " +dutys[2]);
        bot.sendContact(msgChatId, dutys[0], dutys[1]);
      });
  };
});


bot.onText(/\/duty (.+)/, (msg,match) => { 
  let msgChatId = msg.chat.id;
  let dateFromUser = match[1].split('.');
  let dateNow = new Date().getTime();
  let minDate = new Date(2018,0,01).getTime();
  let maxDate = new Date(2050,0,01).getTime();
  dateFromUser = new Date(dateFromUser[2], (dateFromUser[1] - 1), dateFromUser[0], dateFromUser[3] || 0, dateFromUser[4] || 0).getTime(); 
  
  if (dateFromUser > maxDate || isNaN(dateFromUser) || dateFromUser < minDate ) {
    bot.sendMessage(msgChatId, "Неверный формат или нарушен порог! Порог даты от 01.01.2018г. до 01.01.2050г.\nПопробуйте еще раз!");
  } else {
  updateDate(dateFromUser)
  .then( async (dutys) => {
    if (dutys[1] == holiday.first[1] && dutys[2] == 'дневная') { 
      dutys[1] = holiday.second[1]; 
      dutys[0] = holiday.second[0];          
    };
    if (dutys[1] == holiday.first[1] && dutys[2] == 'ночная') { 
      dutys[1] = holiday.third[1]; 
      dutys[0] = holiday.third[0];
    };
    await bot.sendMessage(msgChatId, `Дежурный на дату: ${formatDate(new Date(dateFromUser))} ${dutys[1]}, смена ${dutys[2]}`);
    bot.sendContact(msgChatId, dutys[0], dutys[1]);     
  });
  };      
});


let holiday = { first:[] };
  
  bot.onText(/\/holiday/, (msg, match) => {
    let msgChatId = msg.chat.id;
    console.log(msgChatId);
    if (msgChatId == 119110758 || 178736163 == msgChatId) 
      bot.sendMessage(msgChatId, "Выберите кого нужно сменить", vars.holidayList);  
  });


bot.on('callback_query', function (msg) {
    
    let data = msg.data.split(' ');
    const chatId = msg.message.chat.id;
    
    if (data[0] == 'holiday') {
      setHoliday(data[1], 'first'); 
      bot.deleteMessage(chatId, msg.message.message_id);   
      bot.sendMessage(chatId, "Выберите кто сменяет в день", vars.dayShift);
    };
    if (data[0] == 'dayShift') {
      setHoliday(data[1], 'second'); 
      bot.deleteMessage(chatId, msg.message.message_id);   
      bot.sendMessage(chatId, "Выберите кто сменяет в ночь", vars.nightShift);
    };
    if (data[0] == 'nightShift') {
      setHoliday(data[1], 'third');
      bot.deleteMessage(chatId, msg.message.message_id);
      bot.sendMessage(chatId, `Дежурного ${holiday.first[1]} сменяет в день ${holiday.second[1]}, в ночь ${holiday.third[1]}`);   
    };
    if (data[0] == 'cancel') {
      holiday.first = [];
      bot.deleteMessage(chatId, msg.message.message_id);
      bot.sendMessage(chatId,'Смены отменены');   
    };
    bot.answerCallbackQuery(msg.id);
  });


function setHoliday(data, place) {
  switch (data) {
    case 'Abror':
      holiday[place] = vars.dutyList.Abror;
    break;

    case 'Albert':
      holiday[place] = vars.dutyList.Albert;
    break;

    case 'Andrey':
      holiday[place] = vars.dutyList.Andrey;
    break;

    case 'Ivan':
      holiday[place] = vars.dutyList.Ivan;
    break;
  };
};


//Function for update date and find duty admin
function updateDate(dateNow,update) {
  
  return new Promise(function (resolve, reject) {
    
    User.find({}, (err,data) => {
      if (err) throw err;
  
      for (var i = 0; i < data.length; i++) {
  
        while ((dateNow - data[i].date) > hours_12) {
       
            switch (data[i].status) {  
              case 'дневная': 
                data[i].date =  data[i].date + hours_12 * 3;  
                data[i].status = 'ночная';                      
              break;
  
              case 'ночная': 
                data[i].date =  data[i].date + hours_12 * 5;  
                data[i].status = 'дневная';                      
              break;        
            };
          if (update && (dateNow - data[i].date) < hours_12) {
            User.findByIdAndUpdate(
              data[i]._id, 
              {date: data[i].date, status: data[i].status}, 
              {new:true}, 
              (err,result) => {   
                if (err) throw err;    
                console.log(result);
              }
            );
          };
        };
        while (( data[i].date - dateNow) > hours_12) {
          
          switch (data[i].status) {  
            case 'дневная': 
              data[i].date =  data[i].date - hours_12 * 5;  
              data[i].status = 'ночная';                      
            break;

            case 'ночная': 
              data[i].date =  data[i].date - hours_12 * 3;  
              data[i].status = 'дневная';                      
            break;        
          };
        };
        if ((dateNow - data[i].date) < hours_12 && (dateNow - data[i].date) >= 0) {
          let dutys = [data[i].phone, data[i].name, data[i].status];
          resolve(dutys); 
        };
      };
    });
  });  
}; 


//Function for format date
function formatDate(date) {

  var dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  var yy = date.getFullYear();

  var hh = date.getHours();
  if (hh < 10) hh = '0' + hh;

  var mins = date.getMinutes();
  if (mins < 10) mins = '0' + mins;

  return dd + '.' + mm + '.' + yy + ' время: ' + hh + ':' + mins;
};
