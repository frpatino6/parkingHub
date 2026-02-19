export interface CancelTicketDto {
  /** Extracted from JWT — never from request body */
  tenantId: string;
  branchId: string;
  operatorId: string;
  ticketId: string;
  reason: string;
}
