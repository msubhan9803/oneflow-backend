const constants = require('../utils/constants');
const { scheduledTestService } = require('../services');

const markRequestAsExpired = async (agenda) => {
  agenda.define(constants.agendaJobs.mark_request_as_expired, async (job) => {
    const { scheduledTestId } = job.attrs.data;

    await scheduledTestService.markRequestAsExpired(scheduledTestId);
  });
};

module.exports = markRequestAsExpired;
