const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const countyRoute = require('./county.route');
const jobsiteRoute = require('./jobsite.route');
const noteRoute = require('./note.route');
const subscriptionsRoute = require('./subscription.route');
const settingsRoute = require('./settings.route');
const scheduledTest = require('./scheduledTest.route');
const s3Route = require('./s3.route');
const generalRoute = require('./general.route');
const reportRoute = require('./report.route');
const backflowRoute = require('./backflow.route');
const notifications = require('./notification.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/counties',
    route: countyRoute,
  },
  {
    path: '/jobsites',
    route: jobsiteRoute,
  },
  {
    path: '/notes',
    route: noteRoute,
  },
  {
    path: '/notes',
    route: noteRoute,
  },
  {
    path: '/subscriptions',
    route: subscriptionsRoute,
  },
  {
    path: '/settings',
    route: settingsRoute,
  },
  {
    path: '/scheduledTests',
    route: scheduledTest,
  },
  {
    path: '/s3',
    route: s3Route,
  },
  {
    path: '/general',
    route: generalRoute,
  },
  {
    path: '/reports',
    route: reportRoute,
  },
  {
    path: '/backflows',
    route: backflowRoute,
  },
  {
    path: '/notifications',
    route: notifications,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
