# Sustentacion Proyecto Final - Bases de Datos 2

## 1. Nombre del proyecto

**EHM Vehicles: plataforma de analitica para concesionario de vehiculos con Data Warehouse**

El proyecto consiste en una aplicacion web para un concesionario donde los usuarios pueden:

- iniciar sesion;
- consultar vehiculos por marca;
- ver el detalle de cada vehiculo;
- comparar vehiculos;
- marcar favoritos;
- simular credito para un vehiculo especifico;
- generar datos de comportamiento que luego son analizados por un administrador.

El enfoque principal de Bases de Datos 2 es:

**C. Bodegas de Datos / Data Warehouse**

Se implementa una separacion entre la base operacional de la aplicacion y una base analitica para tableros directivos.

---

## 2. Problematica

Un concesionario necesita saber cuales vehiculos y marcas generan mas interes real en sus usuarios. No basta con tener un catalogo; tambien es importante responder preguntas como:

- Que marcas son mas consultadas?
- Que vehiculos generan mas intencion de compra?
- Que usuarios tienen mayor probabilidad de convertirse en clientes?
- Que rangos de precio tienen mejor respuesta?
- Que vehiculos son muy vistos pero no llegan a simulacion de credito?
- Como evolucionan las interacciones en el tiempo?

La solucion usa datos operacionales generados por los usuarios y los transforma en informacion analitica para apoyar decisiones comerciales.

---

## 3. Criterios de evaluacion del proyecto

### 3.1 Funcionalidad - 30%

El sistema cumple con el objetivo planteado:

- Los usuarios pueden navegar vehiculos.
- El sistema registra interacciones reales.
- El usuario puede comparar vehiculos.
- El usuario puede guardar favoritos.
- El usuario puede simular credito asociado a un vehiculo.
- El administrador puede ejecutar la ETL.
- El administrador puede consultar tableros analiticos.

### 3.2 Complejidad tecnica - 30%

El proyecto integra varias tecnologias y buenas practicas:

- Frontend en Vue.
- Backend en NestJS.
- Firebase Authentication para usuarios.
- Firestore como base operacional.
- PostgreSQL/Supabase como Data Warehouse.
- Modelo estrella con dimensiones y hechos.
- ETL desde Firestore hacia PostgreSQL.
- Tableros con consultas analiticas.
- Filtros por marca y vehiculo.
- Indicadores de negocio y conversion.

### 3.3 Sustentacion - 40%

La sustentacion debe explicar claramente:

- De donde salen los datos.
- Como se almacenan en la base operacional.
- Como se ejecuta la ETL.
- Como se transforman los datos.
- Como se cargan al Data Warehouse.
- Como se consultan los tableros.
- Que decisiones permite tomar el sistema.

---

## 4. Arquitectura general

```txt
Usuario
  |
  v
Frontend Vue
  |
  v
Backend NestJS
  |
  +----------------------+
  |                      |
  v                      v
Firestore             PostgreSQL / Supabase
Base operacional      Data Warehouse
  |                      ^
  |                      |
  +------ ETL -----------+
```

### 4.1 Rol de cada componente

**Frontend Vue**

- Muestra el catalogo.
- Permite comparar vehiculos.
- Permite marcar favoritos.
- Permite simular credito.
- Muestra el dashboard administrativo.

**Backend NestJS**

- Protege endpoints con Firebase Auth.
- Gestiona vehiculos, usuarios e interacciones.
- Ejecuta la ETL.
- Consulta el Data Warehouse para los tableros.

**Firestore**

- Es la base operacional.
- Guarda los datos generados por la aplicacion en tiempo de uso.
- Guarda eventos sin transformar.

**PostgreSQL/Supabase**

- Es el Data Warehouse.
- Guarda dimensiones y hechos.
- Permite consultas analiticas.
- Alimenta los tableros administrativos.

---

## 5. Origen de los datos

Los datos nacen desde las acciones del usuario en la aplicacion.

### 5.1 Datos maestros

Estos datos describen entidades principales:

```txt
users
brands
vehicles
```

### 5.2 Datos transaccionales o eventos

Estos datos representan acciones del usuario:

```txt
vehicle_views
vehicle_comparisons
favorites
credit_simulations
```

### 5.3 Acciones que generan eventos

| Accion del usuario | Coleccion Firestore | Proposito |
|---|---|---|
| Ver detalle de vehiculo | vehicle_views | Medir interes inicial |
| Comparar dos vehiculos | vehicle_comparisons | Medir interes comparativo |
| Marcar favorito | favorites | Medir interes guardado |
| Simular credito | credit_simulations | Medir intencion financiera |

---

## 6. Firestore como base operacional

Firestore se usa para almacenar los datos operacionales de la aplicacion.

### 6.1 Colecciones principales

```txt
users
- uid
- email
- displayName
- role
- createdAt
- updatedAt
```

```txt
brands
- id
- name
- image
- createdAt
- updatedAt
```

```txt
vehicles
- id
- model
- brandId
- type
- image
- description
- price
- year
- mileage
- fuelType
- transmission
- seats
- engine
- createdAt
- updatedAt
```

```txt
vehicle_views
- id
- userId
- vehicleId
- brandId
- viewedAt
- syncedToWarehouse
- syncedAt
```

```txt
vehicle_comparisons
- id
- userId
- firstVehicleId
- secondVehicleId
- comparedAt
- syncedToWarehouse
- syncedAt
```

```txt
favorites
- id
- userId
- vehicleId
- createdAt
- syncedToWarehouse
- syncedAt
```

```txt
credit_simulations
- id
- userId
- vehicleId
- vehiclePrice
- downPayment
- amountFinanced
- termMonths
- interestRate
- estimatedMonthlyPayment
- simulatedAt
- syncedToWarehouse
- syncedAt
```

### 6.2 Nota importante sobre favoritos

La coleccion `favorites` representa el **estado actual** del favorito, no un historial completo de agregar/quitar favorito.

Esto significa:

- Si el usuario marca favorito, existe el documento.
- Si el usuario quita favorito, se elimina el documento.
- Para historial completo seria ideal tener una coleccion adicional `favorite_events`.

Para este proyecto, los favoritos se sustentan como:

> Interes guardado por el usuario al momento de la carga ETL.

---

## 7. Data Warehouse en PostgreSQL/Supabase

El Data Warehouse usa un modelo estrella.

El modelo estrella separa:

- **Dimensiones:** describen entidades.
- **Hechos:** almacenan eventos o mediciones.

---

## 8. Modelo estrella

### 8.1 Dimensiones

```txt
dim_users
- user_key
- firebase_uid
- name
- email
- role
```

```txt
dim_brands
- brand_key
- firestore_brand_id
- brand_name
```

```txt
dim_vehicles
- vehicle_key
- firestore_vehicle_id
- model
- brand_key
- type
- year
- price
- mileage
- fuel_type
- transmission
- seats
- engine
```

```txt
dim_date
- date_key
- full_date
- day
- month
- month_name
- quarter
- year
- weekday
- weekday_name
```

### 8.2 Hechos

```txt
fact_interactions
- interaction_key
- firestore_event_id
- user_key
- vehicle_key
- brand_key
- date_key
- interaction_type
- interaction_count
- event_timestamp
- loaded_at
```

Tipos de interaccion:

```txt
view
compare
favorite
```

```txt
fact_comparison_vehicles
- comparison_vehicle_key
- firestore_comparison_id
- user_key
- vehicle_key
- brand_key
- date_key
- compared_at
- loaded_at
```

```txt
fact_credit_simulations
- simulation_key
- firestore_simulation_id
- user_key
- vehicle_key
- brand_key
- date_key
- vehicle_price
- down_payment
- amount_financed
- term_months
- interest_rate
- estimated_monthly_payment
- simulated_at
- loaded_at
```

### 8.3 Vista analitica

```txt
vw_brand_popularity
```

Se usa para consultar rapidamente popularidad por marca.

### 8.4 Tablas agregadas opcionales

```txt
agg_brand_popularity
agg_vehicle_popularity
```

Estas tablas son opcionales. Sirven como optimizacion si se quiere guardar resultados precalculados.

En la version actual, la mayor parte de los tableros se apoya en consultas sobre hechos, dimensiones y vistas.

---

## 9. Proceso ETL

ETL significa:

```txt
Extract - Transform - Load
Extraer - Transformar - Cargar
```

### 9.1 Extract

La ETL lee datos desde Firestore:

```txt
users
brands
vehicles
vehicle_views
vehicle_comparisons
favorites
credit_simulations
```

Para eventos, solo lee documentos pendientes:

```txt
syncedToWarehouse = false
```

### 9.2 Transform

La ETL transforma documentos operacionales en registros analiticos.

Ejemplo de transformacion:

```txt
Firestore vehicle_views
- userId
- vehicleId
- viewedAt

Data Warehouse fact_interactions
- user_key
- vehicle_key
- brand_key
- date_key
- interaction_type = 'view'
- event_timestamp
```

Tambien convierte IDs operacionales en claves sustitutas:

```txt
Firebase UID     -> dim_users.user_key
Firestore brand  -> dim_brands.brand_key
Firestore vehicle -> dim_vehicles.vehicle_key
Fecha del evento -> dim_date.date_key
```

### 9.3 Load

La ETL carga los datos transformados a PostgreSQL/Supabase:

```txt
dim_users
dim_brands
dim_vehicles
dim_date
fact_interactions
fact_comparison_vehicles
fact_credit_simulations
```

Luego marca el documento de Firestore como sincronizado:

```txt
syncedToWarehouse = true
syncedAt = fecha de sincronizacion
```

---

## 10. Ejecucion de la ETL

La ETL se ejecuta desde el panel administrativo.

Endpoint principal:

```txt
POST /api/admin/warehouse/run-etl
```

Tambien existen endpoints por etapa:

```txt
POST /api/admin/warehouse/run-etl/users
POST /api/admin/warehouse/run-etl/brands
POST /api/admin/warehouse/run-etl/vehicles
POST /api/admin/warehouse/run-etl/vehicle-views
POST /api/admin/warehouse/run-etl/favorites
POST /api/admin/warehouse/run-etl/comparisons
POST /api/admin/warehouse/run-etl/credit-simulations
```

Estado de la ETL:

```txt
GET /api/admin/warehouse/status
```

### 10.1 Ventaja del diseno

El administrador puede:

- generar interacciones en la aplicacion;
- ejecutar sincronizacion;
- ver como cambian los tableros.

Esto facilita mucho la demostracion en clase.

---

## 11. Tableros implementados

Los tableros se consultan desde el backend usando endpoints protegidos para administradores.

El frontend nunca se conecta directamente a PostgreSQL.

```txt
Vue Dashboard
  |
  v
NestJS Admin Stats API
  |
  v
PostgreSQL/Supabase DW
```

---

## 12. Endpoints de estadisticas

```txt
GET /api/admin/stats/summary
GET /api/admin/stats/brand-popularity
GET /api/admin/stats/vehicle-popularity
GET /api/admin/stats/credit-simulations
GET /api/admin/stats/interactions-over-time
GET /api/admin/stats/vehicle-type-preferences
GET /api/admin/stats/user-activity
GET /api/admin/stats/business-insights
```

---

## 13. Metricas principales del dashboard

### 13.1 Resumen general

Muestra indicadores rapidos:

- total de usuarios;
- total de vehiculos;
- total de vistas;
- total de favoritos;
- total de comparaciones;
- total de simulaciones de credito;
- marca lider;
- vehiculo lider;
- ultima sincronizacion.

### 13.2 Interacciones por fecha

Muestra la evolucion temporal de:

- vistas;
- favoritos;
- comparaciones;
- simulaciones de credito.

Incluye filtros:

- por marca;
- por vehiculo, si hay marca seleccionada.

Esta metrica muestra el uso de la dimension fecha y permite analizar comportamiento temporal.

### 13.3 Popularidad por marca

Muestra marcas ordenadas por score.

Formula:

```txt
score = vistas * 1 + comparaciones * 3 + favoritos * 4 + simulaciones_credito * 5
```

Interpretacion:

- una vista representa interes inicial;
- una comparacion representa interes comparativo;
- un favorito representa interes guardado;
- una simulacion de credito representa intencion fuerte de compra.

### 13.4 Vehiculos mas consultados

Muestra vehiculos con mayor score de interes.

Sirve para identificar:

- modelos mas atractivos;
- vehiculos que deberian priorizarse comercialmente;
- inventario con mayor demanda.

### 13.5 Actividad de usuarios

Muestra usuarios con mas interacciones.

Ayuda a detectar:

- usuarios activos;
- posibles clientes;
- usuarios que requieren seguimiento comercial.

### 13.6 Simulaciones de credito

Muestra:

- total de simulaciones;
- precio promedio del vehiculo;
- valor financiado promedio;
- cuota mensual promedio.

Esta metrica conecta el comportamiento de navegacion con la intencion financiera.

---

## 14. Metricas avanzadas agregadas

### 14.1 Embudo de intencion de compra

```txt
Vistas -> Comparaciones -> Favoritos -> Simulaciones de credito
```

Este embudo muestra como los usuarios avanzan desde interes inicial hasta una accion financiera.

Valor para el negocio:

- permite medir conversion;
- identifica donde se pierde interes;
- ayuda a mejorar experiencia comercial.

### 14.2 Conversion por marca

Mide para cada marca:

```txt
creditos / vistas
```

Tambien muestra:

- vistas;
- comparaciones;
- favoritos;
- simulaciones de credito.

Valor para el negocio:

> Una marca no solo es importante por tener muchas vistas. Tambien importa si convierte esas vistas en simulaciones de credito.

### 14.3 Demanda por rango de precio

Agrupa vehiculos por rangos:

```txt
Menos de 50M
50M - 100M
100M - 150M
150M+
Sin precio
```

Muestra:

- vistas;
- favoritos;
- simulaciones de credito;
- cuota mensual promedio.

Valor para el negocio:

- permite saber que rango de precios genera mas interes;
- ayuda a ajustar inventario;
- ayuda a disenar campanas financieras.

### 14.4 Usuarios con mayor intencion

Calcula un lead score por usuario:

```txt
lead_score = vistas * 1 + comparaciones * 3 + favoritos * 4 + creditos * 5
```

Muestra:

- usuario;
- marca de mayor interes;
- lead score;
- ultima interaccion.

Valor para el negocio:

> Permite priorizar usuarios que tienen mayor probabilidad de convertirse en clientes.

### 14.5 Vehiculos vistos sin conversion

Detecta vehiculos con muchas vistas pero pocas simulaciones de credito.

Valor para el negocio:

- identifica vehiculos que atraen atencion pero no convierten;
- puede indicar problemas de precio, informacion incompleta o poca viabilidad financiera;
- ayuda a decidir promociones o ajustes comerciales.

---

## 15. Como se aprovechan los datos

El proyecto no solo almacena datos; los convierte en decisiones.

### 15.1 Decisiones comerciales posibles

Con los tableros, el administrador puede:

- identificar marcas mas fuertes;
- detectar vehiculos con alta intencion;
- priorizar clientes potenciales;
- revisar rangos de precio con mayor demanda;
- ajustar inventario;
- disenar campanas por marca;
- detectar vehiculos con baja conversion;
- medir impacto de cambios en el catalogo.

### 15.2 Ejemplos de analisis

**Caso 1: Marca con muchas vistas pero pocos creditos**

Interpretacion:

- la marca llama la atencion;
- pero los usuarios no avanzan a simulacion;
- puede requerir mejores condiciones financieras.

**Caso 2: Vehiculo con pocas vistas pero muchas simulaciones**

Interpretacion:

- no es el mas visitado;
- pero quienes lo ven tienen alta intencion;
- puede ser buen candidato para promocion.

**Caso 3: Usuario con alto lead score**

Interpretacion:

- ha visto varios vehiculos;
- ha comparado;
- ha guardado favoritos;
- ha simulado credito;
- deberia ser contactado por un asesor.

---

## 16. Seguridad y roles

El sistema usa Firebase Authentication.

Roles:

```txt
customer
admin
```

El dashboard administrativo esta protegido:

```txt
FirebaseAuthGuard
AdminGuard
```

Solo usuarios administradores pueden:

- ejecutar ETL;
- ver tableros;
- consultar estadisticas del Data Warehouse.

---

## 17. Flujo de demostracion sugerido

### Paso 1: Iniciar sesion como usuario normal

Mostrar:

- catalogo de marcas;
- vehiculos por marca.

### Paso 2: Generar eventos

Realizar acciones:

- abrir detalle de un vehiculo;
- comparar dos vehiculos;
- marcar favorito;
- simular credito para un vehiculo.

Esto crea documentos en Firestore:

```txt
vehicle_views
vehicle_comparisons
favorites
credit_simulations
```

### Paso 3: Iniciar sesion como admin

Entrar al dashboard.

### Paso 4: Ejecutar ETL

Presionar:

```txt
Sincronizar
```

Explicar:

> La ETL extrae datos operacionales pendientes de Firestore, los transforma a dimensiones y hechos, y los carga al Data Warehouse.

### Paso 5: Mostrar tableros actualizados

Mostrar:

- interacciones por fecha;
- popularidad por marca;
- embudo de intencion;
- conversion por marca;
- demanda por rango de precio;
- usuarios con mayor intencion;
- vehiculos vistos sin conversion.

---

## 18. Diferencia entre base operacional y Data Warehouse

### Base operacional - Firestore

Se enfoca en el funcionamiento diario de la aplicacion.

Caracteristicas:

- datos recientes;
- lectura y escritura desde la app;
- estructura orientada a la operacion;
- eventos sin transformar.

### Data Warehouse - PostgreSQL/Supabase

Se enfoca en analisis.

Caracteristicas:

- datos historicos;
- modelo estrella;
- dimensiones y hechos;
- consultas agregadas;
- tableros directivos.

---

## 19. Por que esto cumple con Bases de Datos 2

El proyecto aplica conceptos de la asignatura:

- separacion entre base operacional y base analitica;
- diseno de Data Warehouse;
- modelo estrella;
- proceso ETL;
- dimensiones;
- tablas de hechos;
- analitica historica;
- tableros para toma de decisiones;
- consultas agregadas;
- indicadores de negocio.

---

## 20. Posibles mejoras futuras

### 20.1 Historial completo de favoritos

Crear:

```txt
favorite_events
- userId
- vehicleId
- action: add | remove
- createdAt
- syncedToWarehouse
```

Esto permitiria analizar:

- favoritos agregados;
- favoritos eliminados;
- cambios de interes en el tiempo.

### 20.2 ETL programada

Actualmente la ETL puede ejecutarse desde el admin.

Mejora:

- programarla cada cierto tiempo;
- usar Cloud Scheduler, GitHub Actions o cron del backend.

### 20.3 Power BI

Conectar Power BI directamente a Supabase/PostgreSQL para crear un tablero directivo externo.

Esto reforzaria la linea de Data Warehouse.

### 20.4 Recomendaciones personalizadas

Usar datos del usuario:

- marcas mas vistas;
- tipos de vehiculo preferidos;
- rango de precio consultado;
- historial de simulaciones.

Para recomendar vehiculos similares.

---

## 21. Frase de cierre para la sustentacion

> EHM Vehicles transforma un catalogo de vehiculos en una plataforma analitica. Las acciones de los usuarios se capturan en Firestore, se procesan mediante ETL y se almacenan en un Data Warehouse en PostgreSQL/Supabase. A partir de ese modelo estrella, el administrador puede consultar tableros que muestran popularidad, conversion, intencion de compra y oportunidades comerciales. De esta forma, el sistema no solo gestiona informacion, sino que apoya la toma de decisiones del concesionario.

