export interface ChangeOwnPasswordDto {
  userId: string;
  tenantId: string;
  currentPassword: string;
  newPassword: string;
}
