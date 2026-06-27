export type DrivingSchoolProfile = Readonly<{
  name: string;
  logoUrl: string;
}>;

export const mockDrivingSchool: DrivingSchoolProfile = {
  name: "DriveRight Academy",
  logoUrl: "/schools/drive-right-logo.svg",
};
