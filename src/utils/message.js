const UserRegisteredMessage = 'User registered successfully. Please verify your Email';
const UserCreatedMessage = 'User created successfully. Verification email sent';
const EmailSuccessfullyVerified = 'Email successfully verified';
const VerificationTokenExpiredResentEmail = 'Verification token expired. Email verification resent';
const RsetPasswordEmailSent = 'Reset password email sent';
const ResetPasswordSuccess = 'Password reset successfully';
const PasswordResetFailed = 'Password reset failed';
const AccountAlreadyVerified = 'Account already verified';
const AccountVerifiedByAdmin = 'Account has been verified by admin';
const UserNotFound = 'User not found';
const ResourceNotFound = 'Resource not found';
const UnauthorizedAccess = 'Unauthorized access';
const ResourceUpdatedSuccessfully = 'Resource updated successfully';
const ResourceDeletedSuccessfully = 'Resource deleted successfully';
const IncorrectEmailOrPassword = 'Incorrect email or password';
const EmailNotVerified = 'Email not verified';
const EmailVerificationFailed = 'Email verification failed';
const EmailVerificationSent = 'Email verification Sent';
const YourEmailAddressIsAlreadyInUse = 'Email address is already in use.';
const ResourceAlreadyExists = 'Resource already exists';
const MaxJobisteLimitReached = 'Maximum jobsites limit reached for the subscribed plan';
const JobsiteAlreadyExists = 'A Jobsite With That Name Already Exists';
const EmailIsUnique = 'Email is unique';
const FileNotSupported = 'File Not Supported';
const StatusUpdatedSuccessfully = 'Status Updated Successfully';
const TripFeeChargedSuccessfully = 'Trip Fee Charged Successfully';
const BackflowTestExtendedSuccessfully = 'Backflow Test Extended Successfully';
const ChargedCustomerATripFee = 'CHARGED CUSTOMER A TRIP FEE';
const AditionalTestsFee = 'YOU WERE CHARGED FOR ADITIONAL TESTS';
const ScheduleTestRescheduled = 'Scheduled Test Rescheduled';
const ScheduleTestRequestConfirmed = 'Scheduled Test Request has been confirmed';
const NetUserApproved = 'Net User Approved Successfully';
const YourNetApprovalRequestApproved = 'Your Net Approval Request Successfully Approved';
const AccountActivated = 'Your account has been activated.';
const AccountDeactivated = 'Your account has been deactivated.';
const AccountDeleted = 'Your account has been deleted.';
const UserAccountDeleted = 'User account has been deleted.';
const s3UploadError = 'Error deleting the file';
const s3FileRetrieveError = 'Error retrieving the object';
const s3UploadingError = 'Error uploading the file';
const SubscriptionUpdatedSuccessfully = 'Subscription updated successfully';
const MarkedAsPaid = 'Scheduled Test marked as Paid successfully';
const MarkedAsUnpaid = 'Scheduled Test marked as Unpaid successfully';
const JobsiteAlreadyScheduled = 'Jobsite Already Scheduled';
const JobsiteAlreadyInUse = 'Jobsite Already In Use';
const ReportSharedSuccessfully = 'Report shared successfully';
const RequestLogStatusUpdatedTo = 'STATUS UPDATED TO';
const InvalidCurrentPassword = 'Invalid Current Password';
const PasswordChanged = 'Password updated';
const CurrentJobsitesCountIsExceedingLimit = 'Your current Jobsites count is exceeding selected subscription limit';
const NetUser = 'Your account is net';
const AlreadySubscribed = 'Already Subscribed';
const NotificationMarkedAsRead = 'Notification marked as read successfully';
const NotificationsCleared = 'All notifications cleared successfully';
const NoNotificationsFoundForUser = 'No notifications found for the user';
const NotificationNotFound = 'Notification not found';
const NotificationUpdatedSuccessfully = 'Notification updated successfully';

const StatusUpdatedTo = (jobsiteName, status) => `The service request status for "${jobsiteName}" was changed to: ${status}`;
const ScheduledTestStatusPendingMessage = () => 'Your backflow service request has not been confirmed as yet.';
const ScheduledTestStatusScheduledMessage = (assignedTechnician) =>
  `Your backflow service request has been confirmed. We’ll see you soon. Your technician’s name is ${assignedTechnician}.`;
const ScheduledTestStatusRepairsNeededMessage = () => 'Your technician will be in touch soon. See their notes below:';
const ScheduledTestStatusPassedMessage = () => 'All set! Your technician will be in touch soon with more details.';
const ScheduledTestStatusNotAvailableMessage = (xAmount) =>
  `Looks like you weren’t ready for your appointment. A trip fee of $${xAmount} will be assessed. Reschedule your service request below. Rescheduling will only update the time and date of your request. You won’t be charged again for your backflow service.`;

module.exports = {
  UserRegisteredMessage,
  UserCreatedMessage,
  EmailSuccessfullyVerified,
  VerificationTokenExpiredResentEmail,
  RsetPasswordEmailSent,
  ResetPasswordSuccess,
  PasswordResetFailed,
  AccountAlreadyVerified,
  AccountVerifiedByAdmin,
  UserNotFound,
  ResourceNotFound,
  UnauthorizedAccess,
  ResourceUpdatedSuccessfully,
  ResourceDeletedSuccessfully,
  IncorrectEmailOrPassword,
  EmailNotVerified,
  EmailVerificationFailed,
  EmailVerificationSent,
  YourEmailAddressIsAlreadyInUse,
  ResourceAlreadyExists,
  MaxJobisteLimitReached,
  JobsiteAlreadyExists,
  EmailIsUnique,
  FileNotSupported,
  StatusUpdatedSuccessfully,
  TripFeeChargedSuccessfully,
  BackflowTestExtendedSuccessfully,
  StatusUpdatedTo,
  RequestLogStatusUpdatedTo,
  ChargedCustomerATripFee,
  AditionalTestsFee,
  ScheduleTestRescheduled,
  ScheduleTestRequestConfirmed,
  NetUserApproved,
  AccountActivated,
  AccountDeactivated,
  AccountDeleted,
  UserAccountDeleted,
  s3UploadError,
  s3FileRetrieveError,
  s3UploadingError,
  SubscriptionUpdatedSuccessfully,
  MarkedAsPaid,
  MarkedAsUnpaid,
  JobsiteAlreadyScheduled,
  JobsiteAlreadyInUse,
  ReportSharedSuccessfully,
  YourNetApprovalRequestApproved,
  PasswordChanged,
  InvalidCurrentPassword,
  CurrentJobsitesCountIsExceedingLimit,
  NetUser,
  AlreadySubscribed,
  ScheduledTestStatusScheduledMessage,
  ScheduledTestStatusPendingMessage,
  ScheduledTestStatusRepairsNeededMessage,
  ScheduledTestStatusPassedMessage,
  ScheduledTestStatusNotAvailableMessage,
  NotificationMarkedAsRead,
  NotificationsCleared,
  NoNotificationsFoundForUser,
  NotificationNotFound,
  NotificationUpdatedSuccessfully,
};
