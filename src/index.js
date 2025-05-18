const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const agenda = require('./lib/agenda');
// const User = require('./models/user.model');
// const ScheduledTest = require('./models/scheduledTest.model');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(async () => {
  logger.info('Connected to MongoDB');
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });

  // Initialize & Define Agenda Jobs
  const agendaInstance = await agenda.getAgendaInstance();
  agendaInstance
    .start()
    .then(() => console.log('Agenda Started Successfully'))
    .catch((err) => console.log('Agenda Failed to Start: ', err));

  // Updating each user in the users collection
  // User.updateMany({}, [
  //   {
  //     $set: {
  //       // fullName: {
  //       //   $concat: ['$firstName', ' ', { $ifNull: ['$lastName', ''] }],
  //       // },
  //       // isAccountEnabled: true, // or false, depending on what you want to set it to
  //       isAccountDeleted: false,
  //     },
  //   },
  // ])
  //   .then((result) => {
  //     logger.info(`Updated ${result.nModified} users in the database`);
  //   })
  //   .catch((error) => {
  //     logger.error(`Error updating users: ${error.message}`);
  //   });

  // const scheduledTests = await ScheduledTest.find();
  // for (let index = 0; index < scheduledTests.length; index += 1) {
  //   const scheduledTest = scheduledTests[index];
  // console.log('scheduledTest.newInstallationOrReplacement : ', Number(scheduledTest.newInstallationOrReplacement));

  // if (scheduledTest.rushFee > 0) {
  //   scheduledTest.isRush = true;
  // }
  // console.log('scheduledTest.isRush : ', Number(scheduledTest.isRush));

  // /**
  //  * Calculating rank
  //  */
  // scheduledTest.rank = 3 - Number(scheduledTest.newInstallationOrReplacement) - Number(scheduledTest.isRush);
  // console.log('scheduledTest.rank: ', scheduledTest.rank);
  // console.log('  ');

  //   if (scheduledTest.isNetTerms) {
  //     scheduledTest.isPaid = false;
  //   } else {
  //     scheduledTest.isPaid = true;
  //   }

  //   await scheduledTest.save();
  // }

  // ScheduledTest.updateMany({}, [
  //   {
  //     $set: {
  //       isEnabled: true,
  //     },
  //   },
  // ])
  //   .then((result) => {
  //     logger.info(`Updated ${result.nModified} scheduled tests in the database`);
  //   })
  //   .catch((error) => {
  //     logger.error(`Error updating users: ${error.message}`);
  //   });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
