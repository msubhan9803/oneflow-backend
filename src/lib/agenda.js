const { Agenda } = require('agenda');
const config = require('../config/config');
const autoRenewReminderBefore10Days = require('../agendaJobs/autoRenewReminderBefore10Days');
const autoRenewReminderBefore5Days = require('../agendaJobs/autoRenewReminderBefore5Days');
const autoRenewOffReminderBefore5Days = require('../agendaJobs/autoRenewOffReminderBefore5Days');
const paymentReminderBefore5Days = require('../agendaJobs/paymentReminderBefore5Days');
const paymentDueToday = require('../agendaJobs/paymentDueToday');
const finalReminder = require('../agendaJobs/finalReminder');
const accountSuspensionNotice = require('../agendaJobs/accountSuspensionNotice');
const markRequestAsExpired = require('../agendaJobs/markRequestAsExpired');

const AgendaObj = (() => {
  let instance;

  const getdbURI = async () => {
    return config.mongoose.url;
  };

  const createInstance = async () => {
    const dbURI = await getdbURI();
    const agenda = new Agenda({
      db: { address: dbURI },
    });

    // Define Agenda Jobs
    await (async () => {
      await autoRenewReminderBefore10Days(agenda);
      await autoRenewReminderBefore5Days(agenda);
      await autoRenewOffReminderBefore5Days(agenda);
      await paymentReminderBefore5Days(agenda);
      await paymentDueToday(agenda);
      await finalReminder(agenda);
      await accountSuspensionNotice(agenda);
      await markRequestAsExpired(agenda);
    })();
    return agenda;
  };

  return {
    getAgendaInstance: async () => {
      if (!instance) {
        instance = await createInstance();
      }
      return instance;
    },
  };
})();

module.exports = AgendaObj;
