const USER_ACCOUNT_TYPES = {
  commercial: 'commercial',
  homeOwnerOrTenant: 'homeOwnerOrTenant',
};

const PAYMENT_TERMS_TYPES = {
  net20: 20,
  net30: 30,
  net45: 45,
};

const JOBSITE_STATUS_TYPES = {
  inUse: 'inUse',
  unassigned: 'unassigned',
};

const SUBSCRIPTION_TYPES = {
  free: 'free',
  pro: 'pro',
  proPlus: 'proPlus',
};

const ScheduledTestYesSureNoteSure = {
  yes: 'yes',
  no: 'no',
  not_sure: 'not_sure',
};

const IsNetTermsApprovedByAdminTypes = {
  notApplicable: 'notApplicable',
  pending: 'pending',
  approved: 'approved',
};

const ScheduledTestStasuses = {
  pending: 'pending',
  scheduled: 'scheduled',
  repairsNeeded: 'repairsNeeded',
  passed: 'passed',
  notAvailable: 'notAvailable',
  expired: 'expired',
};

const ReportStatuses = {
  pending: 'pending',
  completed: 'completed',
};

const BackflowTestStatuses = {
  passed: 'passed',
  failed: 'failed',
};

const timeSlots = [
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
];

const stripeCurrency = 'usd';

const agendaJobs = {
  auto_renew_on_before_10_days: 'auto_renew_on_before_10_days',
  auto_renew_on_before_5_days: 'auto_renew_on_before_5_days',
  auto_renew_off_before_5_days: 'auto_renew_off_before_5_days',
  payment_reminder_before_5_days: 'payment_reminder_before_5_days',
  payment_due_today: 'payment_due_today',
  final_reminder: 'final_reminder',
  account_suspension_notice: 'account_suspension_notice',
  mark_request_as_expired: 'mark_request_as_expired',
};

const NOTIFICATION_STATE_TYPES = {
  REQUEST_CONFIRMATION: 'REQUEST_CONFIRMATION',
  STATUS_UPDATE: 'STATUS_UPDATE',
  REPORT_READY: 'REPORT_READY',
  REMINDER: 'REMINDER',
  USER_CREDITED_POINTS: 'USER_CREDITED_POINTS',
  NEW_REQUEST: 'NEW_REQUEST',
  PAYMENT_REMINDER: 'PAYMENT_REMINDER',
  PAYMENT_DUE: 'PAYMENT_DUE',
  NET_PAYMENT_DUE: 'NET_PAYMENT_DUE',
  FINAL_REMINDER: 'FINAL_REMINDER',
  ACCOUNT_SUSPENSION_NOTICE: 'ACCOUNT_SUSPENSION_NOTICE',
};

module.exports = {
  USER_ACCOUNT_TYPES,
  PAYMENT_TERMS_TYPES,
  JOBSITE_STATUS_TYPES,
  SUBSCRIPTION_TYPES,
  ScheduledTestYesSureNoteSure,
  ScheduledTestStasuses,
  IsNetTermsApprovedByAdminTypes,
  timeSlots,
  stripeCurrency,
  ReportStatuses,
  BackflowTestStatuses,
  agendaJobs,
  NOTIFICATION_STATE_TYPES,
};
