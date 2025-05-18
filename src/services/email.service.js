const sendgridMail = require('@sendgrid/mail');
const constants = require('../utils/constants');
const {
  getSubject1,
  getSubject2,
  getMessageDark,
  getMessageGray,
  getTitleBlack,
  getSubtitle1,
  getHr,
  getBr,
  getButton,
  getTable,
  getTableRow1,
  getTableRow2,
} = require('../helpers/email.helper');

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

const oneFlowEmailTemplateGeneral = process.env.ONE_FLOW_EMAIL_TEMPLATE_GENERAL;
const sendChargedTripFeeEmailTemplateId = 'd-90fd30f0832e4da3a77f704e4e6defd1';
const sendAddExtraTestEmailTemplateId = 'd-cec3a8ef58974107beed92585c26f2d1';
const sendScheduledTestRescheduleTemplateId = 'd-f454ff1307ca4789a0e49a6cd6d3c004';

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, emailObj) => {
  const { subject, subject2, message, verificationLink } = emailObj;

  let dynamicHtml = '';
  dynamicHtml += getSubject2(subject2);
  dynamicHtml += getMessageGray(message);
  dynamicHtml += getButton('VERIFY ACCOUNT', verificationLink);
  dynamicHtml += getBr();

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject,
    dynamic_template_data: {
      dynamicHtml,
      subject,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, emailObj) => {
  const { subject, subject2, message, resetPasswordUrl } = emailObj;

  let dynamicHtml = '';
  dynamicHtml += getSubject2(subject2);
  dynamicHtml += getMessageGray(message);
  dynamicHtml += getButton('RESET PASSWORD', resetPasswordUrl);
  dynamicHtml += getBr();

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject,
    dynamic_template_data: {
      dynamicHtml,
      subject,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send User Management Email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendUserManagementEmail = async (to, emailObj) => {
  const { subject, subject2, message, details, isAccountEnabled, loginLink } = emailObj;

  let dynamicHtml = '';
  dynamicHtml += getSubject2(subject2);
  dynamicHtml += getMessageGray(message);
  dynamicHtml += getHr();
  dynamicHtml += getSubtitle1('DETAILS');
  dynamicHtml += getMessageDark(details);
  dynamicHtml += isAccountEnabled ? getButton('LOG IN', loginLink) : getButton('CONTACT SUPPORT', 'tel:7148521213');
  dynamicHtml += getBr();

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject,
    dynamic_template_data: {
      dynamicHtml,
      subject,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send User Net Account Approval Notify
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendUserNetAccountApprovalNotify = async (to, emailObj) => {
  const { subject, subject2, message, loginLink } = emailObj;

  let dynamicHtml = '';
  dynamicHtml += getSubject2(subject2);
  dynamicHtml += getMessageGray(message);
  dynamicHtml += getHr();
  dynamicHtml += getButton('GET STARTED', loginLink);
  dynamicHtml += getBr();

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject,
    dynamic_template_data: {
      dynamicHtml,
      subject,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send Scheduled Test Creation Email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendScheduledTestCreationEmail = async (to, emailObj) => {
  const {
    subject,
    message,
    jobsiteName,
    serviceConfirmationNumber,
    scheduledDate,
    preferredScheduledTime,
    numberOfBackflows,
    rushFee,
    total,
    checkStatusLink,
  } = emailObj;

  let dynamicHtml = '';
  dynamicHtml += getSubject1(subject);
  dynamicHtml += getMessageGray(message);
  dynamicHtml += getHr();

  dynamicHtml += getSubtitle1('SERVICE CONFIRMATION #');
  dynamicHtml += getMessageDark(serviceConfirmationNumber);

  dynamicHtml += getSubtitle1('LOCATION');
  dynamicHtml += getMessageDark(jobsiteName);

  dynamicHtml += getSubtitle1('SCHEDULED DATE');
  dynamicHtml += getMessageDark(scheduledDate);

  dynamicHtml += getSubtitle1('PREFERRED TIME');
  dynamicHtml += getMessageDark(preferredScheduledTime);

  dynamicHtml += getHr();

  const tableElem = [getTableRow1('No. of Backflows:', numberOfBackflows)];

  if (rushFee > 0) {
    tableElem.push(getTableRow1('Rush/Emergency fee:', rushFee));
  }

  tableElem.push(getTableRow2('TOTAL', total));

  dynamicHtml += getTable(tableElem);

  dynamicHtml += getHr();

  dynamicHtml += getButton('CHECK STATUS', checkStatusLink);
  dynamicHtml += getBr();

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject: `One Flow - ${subject}`,
    dynamic_template_data: {
      dynamicHtml,
      subject: `One Flow - ${subject}`,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send Confirm Request Email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendConfirmRequestEmail = async (to, emailObj) => {
  const { subject, message, jobsiteName, streetAddress, confirmedDate, confirmedTime, numberOfBackflows, checkStatusLink } =
    emailObj;

  let dynamicHtml = '';
  dynamicHtml += getTitleBlack(message);
  dynamicHtml += getHr();

  dynamicHtml += getSubtitle1('JOBSITE NAME');
  dynamicHtml += getMessageDark(jobsiteName);

  dynamicHtml += getSubtitle1('LOCATION');
  dynamicHtml += getMessageDark(streetAddress);

  dynamicHtml += getSubtitle1('CONFIRMED DATE');
  dynamicHtml += getMessageDark(confirmedDate);

  dynamicHtml += getSubtitle1('CONFIRMED TIME');
  dynamicHtml += getMessageDark(confirmedTime);

  dynamicHtml += getSubtitle1('NO. OF BACKFLOWS');
  dynamicHtml += getMessageDark(numberOfBackflows);

  dynamicHtml += getHr();

  dynamicHtml += getButton('CHECK STATUS', checkStatusLink);
  dynamicHtml += getBr();

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject,
    dynamic_template_data: {
      dynamicHtml,
      subject,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send Updated Scheduled Test Status Email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendUpdatedScheduleTestStatusEmail = async (to, emailObj, type) => {
  const { subject, message, details, checkStatusLink } = emailObj;

  let dynamicHtml = '';
  dynamicHtml += getTitleBlack(message);
  dynamicHtml += getHr();

  dynamicHtml += getSubtitle1('DETAILS');
  dynamicHtml += getMessageDark(details);

  if (type === constants.ScheduledTestStasuses.notAvailable) {
    dynamicHtml += getBr();
    dynamicHtml += getButton('RESCHEDULE NOW', checkStatusLink);
  }

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject,
    dynamic_template_data: {
      dynamicHtml,
      subject,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send Scheduled Test Reschedule Email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendScheduledTestRescheduleEmail = async (to, emailObj) => {
  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: sendScheduledTestRescheduleTemplateId,
    dynamic_template_data: {
      ...emailObj,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send Charged Trip Fee Email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendChargedTripFeeEmail = async (to, emailObj) => {
  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: sendChargedTripFeeEmailTemplateId,
    dynamic_template_data: {
      ...emailObj,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Add Extra Test
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendAddExtraTestEmail = async (to, emailObj) => {
  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: sendAddExtraTestEmailTemplateId,
    dynamic_template_data: {
      ...emailObj,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send Share Report Email
 * @param {string} to - list of recipient email addresses
 * @param {object} emailObj - contains subject, message and attachments
 * @returns {Promise}
 */
const sendShareReportEmail = async (to, emailObj) => {
  try {
    const { message, message2 } = emailObj;

    let dynamicHtml = '';
    // dynamicHtml += getSubject2(subject2);
    dynamicHtml += getSubject2(message2);
    dynamicHtml += getBr();
    dynamicHtml += getMessageGray(message);

    const msg = {
      to,
      from: process.env.SENDGRID_EMAIL_FROM,
      templateId: oneFlowEmailTemplateGeneral,
      subject: emailObj.subject,
      dynamic_template_data: {
        dynamicHtml,
        subject: emailObj.subject,
        message: emailObj.message,
      },
      attachments: emailObj.attachments,
    };

    try {
      await sendgridMail.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  } catch (error) {
    console.error('Error processing attachments:', error);
  }
};

/**
 * Send Upcoming Auto Renewal Scheduled Test Email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendUpcomingAutoRenewalScheduledTestEmail = async (to, emailObj) => {
  const {
    subject,
    subject2,
    message,
    jobsiteName,
    serviceConfirmationNumber,
    scheduledDate,
    preferredScheduledTime,
    numberOfBackflows,
    backflowTestFee,
    total,
  } = emailObj;

  let dynamicHtml = '';
  dynamicHtml += getSubject1(subject2);
  dynamicHtml += getMessageGray(message);
  dynamicHtml += getHr();

  dynamicHtml += getSubtitle1('SERVICE CONFIRMATION #');
  dynamicHtml += getMessageDark(serviceConfirmationNumber);

  dynamicHtml += getSubtitle1('LOCATION');
  dynamicHtml += getMessageDark(jobsiteName);

  dynamicHtml += getSubtitle1('SCHEDULED DATE');
  dynamicHtml += getMessageDark(scheduledDate);

  dynamicHtml += getSubtitle1('PREFERRED TIME');
  dynamicHtml += getMessageDark(preferredScheduledTime);

  dynamicHtml += getHr();

  dynamicHtml += getTable([
    getTableRow1(`No. of Backflows: ${numberOfBackflows}`, `$${backflowTestFee}`),
    getTableRow2('TOTAL', total),
  ]);

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject: `One Flow - ${subject}`,
    dynamic_template_data: {
      dynamicHtml,
      subject: `One Flow - ${subject}`,
      footerChildText: 'YOU’RE RECEIVING THIS EMAIL BECAUSE YOU ENABLED AUTO-TEST FOR THIS JOBSITE.',
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send Auto Renewal Scheduled Test Creation Email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendAutoRenewalScheduledTestCreationEmail = async (to, emailObj) => {
  const {
    subject,
    subject2,
    message,
    jobsiteName,
    serviceConfirmationNumber,
    scheduledDate,
    preferredScheduledTime,
    numberOfBackflows,
    backflowTestFee,
    total,
  } = emailObj;

  let dynamicHtml = '';
  dynamicHtml += getSubject1(subject2);
  dynamicHtml += getMessageGray(message);
  dynamicHtml += getHr();

  dynamicHtml += getSubtitle1('SERVICE CONFIRMATION #');
  dynamicHtml += getMessageDark(serviceConfirmationNumber);

  dynamicHtml += getSubtitle1('LOCATION');
  dynamicHtml += getMessageDark(jobsiteName);

  dynamicHtml += getSubtitle1('SCHEDULED DATE');
  dynamicHtml += getMessageDark(scheduledDate);

  dynamicHtml += getSubtitle1('PREFERRED TIME');
  dynamicHtml += getMessageDark(preferredScheduledTime);

  dynamicHtml += getHr();

  dynamicHtml += getTable([
    getTableRow1(`No. of Backflows: ${numberOfBackflows}`, `$${backflowTestFee}`),
    getTableRow2('TOTAL', total),
  ]);

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject: `One Flow - ${subject}`,
    dynamic_template_data: {
      dynamicHtml,
      subject: `One Flow - ${subject}`,
      footerChildText: 'YOU’RE RECEIVING THIS EMAIL BECAUSE YOU ENABLED AUTO-TEST FOR THIS JOBSITE.',
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send Auto Renewal Off Scheduled Test Email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendAutoRenewalOffScheduledTestEmail = async (to, emailObj) => {
  const {
    subject,
    subject2,
    message,
    jobsiteName,
    serviceConfirmationNumber,
    scheduledDate,
    preferredScheduledTime,
    numberOfBackflows,
    backflowTestFee,
    total,
    scheduleTestLink,
  } = emailObj;

  let dynamicHtml = '';
  dynamicHtml += getSubject1(subject2);
  dynamicHtml += getMessageGray(message);
  dynamicHtml += getHr();

  dynamicHtml += getSubtitle1('SERVICE CONFIRMATION #');
  dynamicHtml += getMessageDark(serviceConfirmationNumber);

  dynamicHtml += getSubtitle1('LOCATION');
  dynamicHtml += getMessageDark(jobsiteName);

  dynamicHtml += getSubtitle1('SCHEDULED DATE');
  dynamicHtml += getMessageDark(scheduledDate);

  dynamicHtml += getSubtitle1('PREFERRED TIME');
  dynamicHtml += getMessageDark(preferredScheduledTime);

  dynamicHtml += getHr();

  dynamicHtml += getTable([
    getTableRow1(`No. of Backflows: ${numberOfBackflows}`, `$${backflowTestFee}`),
    getTableRow2('TOTAL', total),
  ]);

  dynamicHtml += getHr();

  dynamicHtml += getButton('RESCHEDULE', scheduleTestLink);
  dynamicHtml += getBr();

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject: `One Flow - ${subject}`,
    dynamic_template_data: {
      dynamicHtml,
      subject: `One Flow - ${subject}`,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
/**
 * Send Payment Reminder
 * @param {String} to
 * @param {Object} emailObj
 * @returns {Promise}
 */
const sendPaymentReminderEmails = async (to, emailObj) => {
  const { subject, subject2, message } = emailObj;

  let dynamicHtml = '';
  dynamicHtml += getSubject2(subject2);
  dynamicHtml += getMessageGray(message);
  dynamicHtml += getBr();

  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    templateId: oneFlowEmailTemplateGeneral,
    subject,
    dynamic_template_data: {
      dynamicHtml,
      subject,
    },
  };

  try {
    await sendgridMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendScheduledTestCreationEmail,
  sendUpdatedScheduleTestStatusEmail,
  sendChargedTripFeeEmail,
  sendAddExtraTestEmail,
  sendScheduledTestRescheduleEmail,
  sendConfirmRequestEmail,
  sendUserManagementEmail,
  sendShareReportEmail,
  sendUserNetAccountApprovalNotify,
  sendUpcomingAutoRenewalScheduledTestEmail,
  sendAutoRenewalOffScheduledTestEmail,
  sendAutoRenewalScheduledTestCreationEmail,
  sendPaymentReminderEmails,
};
