# TODO: Agregar Gráficos de Evolución de Signos Vitales en Historial de Evolución

## Información Recopilada
- El componente `patient-detail.component.ts` maneja la vista de detalle del paciente.
- Ya tiene secciones para perfil, signos vitales, historial de evolución (con notas) y chat.
- Los signos vitales se obtienen del servicio `VitalService` y se muestran en una grid.
- El proyecto ya tiene `chart.js` y `ng2-charts` instalados en `frontend/package.json`.
- El backend tiene modelos `Vital` y `VitalRecord`, y rutas para obtener vitals filtrados por paciente.
- El layout actual usa CSS Grid con history-section ocupando toda la fila inferior.

## Plan
- Modificar el layout CSS para colocar la sección de historial de evolución en una columna al lado de la sección de chat.
- Agregar imports de Chart.js y ng2-charts en el componente.
- Agregar un canvas para el gráfico en el template del card "Historial de Evolución".
- Procesar los datos de vitals en el componente para crear datasets para gráficos de líneas (uno por tipo de signo vital).
- Mostrar el gráfico encima o debajo de la lista de notas de evolución.

## Pasos Detallados
1. Actualizar el CSS del componente para reorganizar el grid: history-section en columna 1, fila 2; chat-section en columna 2, fila 2.
2. Importar `ChartModule` de `ng2-charts` en el componente.
3. Agregar propiedades en el componente para el gráfico: `chartData`, `chartOptions`, etc.
4. En `ngOnInit`, después de cargar vitals, procesar los datos para crear el chartData.
5. Agregar el elemento `<canvas baseChart [data]="chartData" [options]="chartOptions" type="line"></canvas>` en el template dentro del card de historial de evolución.
6. Probar el componente para asegurar que los gráficos se rendericen correctamente.

## Dependencias
- No se requieren nuevas dependencias; `chart.js` y `ng2-charts` ya están instaladas.
- Archivos a editar: `frontend/src/app/pages/patient-detail/patient-detail.component.ts`

## Seguimiento de Progreso
- [ ] Actualizar CSS para layout de dos columnas en fila inferior.
- [ ] Importar ChartModule en el componente.
- [ ] Agregar propiedades para el gráfico en el componente.
- [ ] Implementar lógica para procesar vitals en chartData.
- [ ] Agregar canvas en el template.
- [ ] Probar y verificar funcionamiento.
