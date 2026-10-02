export type StudentAuthConfig = Readonly<{
  schoolId: string;
  region: string;
  userPoolId: string;
  clientId: string;
  issuer: string;
}>;

export type StudentProfileInput = Readonly<{
  firstName: string;
  lastName: string;
  phoneNumber: string;
}>;

export type SessionTokens = Readonly<{
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}>;

export type SyncResult = Readonly<{
  userId: string;
  email: string;
  schoolId: string;
  studentId: string | null;
  profileRequired: boolean;
}>;

export function authScope(config: StudentAuthConfig): string {
  return [config.schoolId, config.userPoolId, config.clientId].join(":");
}
