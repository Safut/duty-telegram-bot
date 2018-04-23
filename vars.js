const dutyList = {
    Abror:['+998908086628', 'Сапарбаев Аброр'], Albert:['+998935270347', 'Хабибулин Альберт'], 
    Andrey:['+998983645334', 'Валл Андрей'], Ivan:['+998903450041', 'Ефименко Иван']
    };
  
  const holidayList = {
    reply_markup: {
    inline_keyboard: 
    [
      [{ text: 'Abror', callback_data: 'holiday Abror' }],
      [{ text: 'Albert', callback_data: 'holiday Albert' }],
      [{ text: 'Andrey', callback_data: 'holiday Andrey' }],
      [{ text: 'Ivan', callback_data: 'holiday Ivan' }],
      [{ text: 'отмена', callback_data: 'cancel' }]
    ]
  }
  };
  
  
  const dayShift = {
    reply_markup: {
    inline_keyboard: 
    [
      [{ text: 'Abror', callback_data: 'dayShift Abror' }],
      [{ text: 'Albert', callback_data: 'dayShift Albert' }],
      [{ text: 'Andrey', callback_data: 'dayShift Andrey' }],
      [{ text: 'Ivan', callback_data: 'dayShift Ivan' }],
      [{ text: 'отмена', callback_data: 'cancel' }]
    ]
  }
  };
  
  
  const nightShift = {
    reply_markup: {
    inline_keyboard: 
    [
      [{ text: 'Abror', callback_data: 'nightShift Abror' }],
      [{ text: 'Albert', callback_data: 'nightShift Albert' }],
      [{ text: 'Andrey', callback_data: 'nightShift Andrey' }],
      [{ text: 'Ivan', callback_data: 'nightShift Ivan' }],
      [{ text: 'отмена', callback_data: 'cancel' }]
    ]
  }
  };

  module.exports.dutyList = dutyList;
  module.exports.holidayList = holidayList;
  module.exports.dayShift = dayShift;
  module.exports.nightShift = nightShift;
  module.exports.token = '';
  module.exports.mongoUrl = '';
