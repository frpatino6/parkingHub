/**
 * Códigos de acción de auditoría (igual que el backend).
 * Etiquetas solo para presentación y filtros en español; la lógica sigue usando el código.
 */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  TICKET_CREATED: 'Ticket creado',
  TICKET_CANCELLED: 'Ticket cancelado',
  TICKET_CHECKED_OUT: 'Ticket cobrado / salida',
  PRICE_OVERRIDE: 'Precio modificado',
  CASH_CUT_OPENED: 'Arqueo abierto',
  CASH_CUT_CLOSED: 'Arqueo cerrado',
  USER_CREATED: 'Usuario creado',
  USER_UPDATED: 'Usuario actualizado',
  USER_DEACTIVATED: 'Usuario desactivado',
  USER_PASSWORD_RESET: 'Contraseña restablecida',
  USER_PASSWORD_CHANGED: 'Contraseña cambiada',
  BRANCH_CREATED: 'Sede creada',
  BRANCH_UPDATED: 'Sede actualizada',
  BRANCH_DEACTIVATED: 'Sede desactivada',
  PRICING_CONFIG_UPDATED: 'Tarifa actualizada',
  FINANCIAL_MOVEMENT_CREATED: 'Movimiento financiero creado',
};

export const AUDIT_ACTION_OPTIONS = Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function getAuditActionLabel(actionCode: string): string {
  return AUDIT_ACTION_LABELS[actionCode] ?? actionCode;
}
