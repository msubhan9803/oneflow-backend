const axios = require('axios');
const moment = require('moment');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const generateDateAndTime = (date, time) => {
  const parsedTime = moment(time, 'hh:mm A');
  const newDate = moment(date).set({
    hour: parsedTime.get('hour'),
    minute: parsedTime.get('minute'),
    second: 0,
    millisecond: 0,
  });

  return newDate.format('YYYY-MM-DDTHH:mm:ss');
};

const createEventOnSubCalendar = async (payload) => {
  const {
    jobsiteName,
    userInfo,
    location,
    startDate,
    endDate,
    startTime,
    endTime,
    notes,
    // technician
  } = payload;

  const data = JSON.stringify({
    subcalendar_ids: [process.env.TEAMUP_CALENDER_ID],
    start_dt: generateDateAndTime(startDate, startTime),
    end_dt: generateDateAndTime(endDate, endTime),
    all_day: false,
    tz: 'America/Los_Angeles',
    title: jobsiteName,
    location,
    who: userInfo,
    notes,
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.teamup.com/ksur7jsf97bsubezyh/events',
    headers: {
      'Content-Type': 'application/json',
      'Teamup-Token': process.env.TEAMUP_TOKEN,
    },
    data,
  };

  await axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch((error) => {
      throw new ApiError(httpStatus.NOT_FOUND, error);
    });
};

module.exports = {
  createEventOnSubCalendar,
};
