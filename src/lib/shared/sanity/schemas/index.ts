import { userSchema } from './user';
import { subjectSchema } from './subject';
import { educationLevelSchema } from './educationLevel';
import { classLevelSchema } from './classLevel';
import { packagePlanSchema } from './packagePlan';
import { enrollmentSchema } from './enrollment';
import { jobPostSchema } from './jobPost';
import { jobApplicationSchema } from './jobApplication';
import { attendanceRecordSchema } from './attendanceRecord';
import { invoiceRecordSchema } from './invoiceRecord';
import { payrollClaimSchema } from './payrollClaim';
import { recruitmentCandidateSchema } from './recruitmentCandidate';
import { notificationSchema } from './notification';
import { magicLinkSchema } from './magicLink';

export const schemas = [
  userSchema,
  subjectSchema,
  educationLevelSchema,
  classLevelSchema,
  packagePlanSchema,
  enrollmentSchema,
  jobPostSchema,
  jobApplicationSchema,
  attendanceRecordSchema,
  invoiceRecordSchema,
  payrollClaimSchema,
  recruitmentCandidateSchema,
  notificationSchema,
  magicLinkSchema
];
