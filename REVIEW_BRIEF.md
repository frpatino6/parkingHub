# Análisis breve: feature de tarifa por función (teatro)

## Contexto actual
Hoy el cobro normal está orientado a tiempo (minutos/bloques) y el control operativo se apoya en **caja abierta por operador**. Para manejar funciones del teatro, el equipo está resolviendo operativamente con cierre de caja y apertura de otra caja para separar ese periodo.

## Problema
Ese workaround funciona, pero mete fricción:
- más pasos manuales (cerrar/abrir caja),
- más riesgo operativo (errores de responsable o saldos),
- y poca trazabilidad explícita de “esto fue tarifa de función”.

## Solución profesional y simple (recomendada)
Implementar un **Modo Función** muy acotado, sin romper el flujo actual:

1. **Crear una “sesión de función” por sucursal**
   - Campos mínimos: `name`, `startsAt`, `endsAt`, `flatRateCOP`, `active`, `notes?`.
   - Solo una sesión activa por sucursal.

2. **Regla de cobro automática en checkout**
   - Si el ticket cae dentro de una sesión de función activa, cobrar `flatRateCOP`.
   - Si no, mantener el cálculo actual por minutos/bloques.
   - Prioridad clara: **Función > Tarifa normal**.

3. **Trazabilidad contable/auditoría (clave)**
   - Guardar en ticket: `pricingSource = NORMAL | THEATER_EVENT` y `eventSessionId?`.
   - En caja, acumular también `totalEventSales` (además de totales actuales), para reportes simples.

4. **UX mínima (fácil de operar)**
   - Botón en caja o pricing: “Iniciar función” y “Finalizar función”.
   - Mostrar badge visible: “Función activa: $X hasta HH:mm”.
   - No obliga a cerrar/abrir caja para separar ese cobro.

## Por qué esta opción es la mejor
- **Simple para el personal**: 1 acción para activar, 1 para finalizar.
- **Profesional para negocio**: trazabilidad limpia por evento en tickets y reportes.
- **Bajo impacto técnico**: reutiliza checkout/cash-cut existentes, añadiendo una regla de prioridad.

## Implementación incremental sugerida
- **Fase 1 (rápida):** modelo + endpoint start/stop + regla en checkout + campos de trazabilidad en ticket.
- **Fase 2:** reporte de ventas por función y filtros en historial.
- **Fase 3 (opcional):** programación automática de funciones recurrentes.
