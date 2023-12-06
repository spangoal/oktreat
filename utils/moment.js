const moment = require('moment');
const momentTimezone = require('moment-timezone');

exports.startDate = (date, timezone) =>
  moment(`${date} 00:00`, 'DD/MM/YYYY HH:mm').tz(timezone).startOf('day').utc();

exports.endDate = (date, timezone) =>
  moment(`${date} 00:00`, 'DD/MM/YYYY HH:mm').tz(timezone).endOf('day').utc();

exports.UTC = (date, timezone) =>
  momentTimezone.tz(`${date}:00`, 'DD/MM/YYYY HH:mm:ss', timezone).utc();

exports.getWeek = (week) => {
  const days = [];
  let weekStart;

  if (week > 0) weekStart = moment().add(week, 'weeks').startOf('isoWeek');
  else if (week < 0)
    weekStart = moment()
      .subtract(week.toString().split('-')[1], 'weeks')
      .startOf('isoWeek');
  else weekStart = moment().startOf('isoWeek');

  for (let i = 0; i <= 6; i++) {
    days.push(moment(weekStart).add(i, 'days').format('DD/MM/YYYY'));
  }

  return days;
};
