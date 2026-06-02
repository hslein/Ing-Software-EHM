# Explicacion completa de las ETL del Data Warehouse

## 1. Objetivo de las ETL

Las ETL del proyecto conectan la base operacional en Firebase/Firestore con el Data Warehouse en Supabase/PostgreSQL.

Firestore se usa para guardar la operacion diaria de la aplicacion: usuarios, marcas, vehiculos, vistas, favoritos, comparaciones y simulaciones de credito. PostgreSQL se usa como bodega de datos para analisis: popularidad, conversion, preferencias, actividad por fecha, ranking de vehiculos y metricas para tableros administrativos.

El flujo ETL significa:

- **Extract**: leer documentos desde colecciones de Firestore.
- **Transform**: limpiar datos, convertir IDs de Firestore en llaves numericas del Data Warehouse, normalizar fechas y preparar los hechos.
- **Load**: insertar o actualizar dimensiones y cargar eventos en tablas de hechos de PostgreSQL.

## 2. Arquitectura general

```text
Frontend Vue
   |
   | registra interacciones del usuario
   v
Backend NestJS
   |
   | guarda operacion diaria
   v
Firebase / Firestore
   |
   | ETL ejecutada por endpoint admin
   v
Supabase / PostgreSQL Data Warehouse
   |
   | consultas agregadas
   v
Tableros administrativos
```

La ETL esta implementada en:

```text
apps/ehm_back/src/admin/warehouse-etl.service.ts
```

Los endpoints administrativos permiten ejecutar toda la ETL o ejecutar una etapa especifica.

## 3. Endpoints de ejecucion

### Ejecutar toda la ETL

```http
POST /api/admin/warehouse/run-etl?limit=100
```

Ejecuta las etapas en este orden:

1. Usuarios
2. Marcas
3. Vehiculos
4. Vistas de vehiculos
5. Favoritos
6. Comparaciones
7. Simulaciones de credito

Este orden es importante porque primero se cargan dimensiones y despues hechos. Por ejemplo, antes de registrar una vista de vehiculo en `fact_interactions`, deben existir o crearse las llaves en `dim_users`, `dim_vehicles`, `dim_brands` y `dim_date`.

### Ejecutar una etapa especifica

```http
POST /api/admin/warehouse/run-etl/users?limit=100&after=cursor
POST /api/admin/warehouse/run-etl/brands?limit=100&after=cursor
POST /api/admin/warehouse/run-etl/vehicles?limit=100&after=cursor
POST /api/admin/warehouse/run-etl/vehicle-views?limit=100
POST /api/admin/warehouse/run-etl/favorites?limit=100
POST /api/admin/warehouse/run-etl/comparisons?limit=100
POST /api/admin/warehouse/run-etl/credit-simulations?limit=100
```

### Consultar estado

```http
GET /api/admin/warehouse/status
```

Devuelve informacion sobre la ultima ejecucion: estado, fecha, cantidad procesada y error si existio.

## 4. Comportamiento incremental

Las dimensiones (`users`, `brands`, `vehicles`) se pueden reprocesar porque usan `ON CONFLICT DO UPDATE`. Esto permite actualizar datos descriptivos como nombre, marca, modelo o precio.

Los eventos (`vehicle_views`, `favorites`, `vehicle_comparisons`, `credit_simulations`) se procesan de forma incremental usando el campo:

```text
syncedToWarehouse = false
```

Cuando la ETL carga correctamente un evento en PostgreSQL, actualiza el documento en Firestore:

```ts
{
  syncedToWarehouse: true,
  syncedAt: serverTimestamp()
}
```

Esto evita duplicar eventos en el Data Warehouse. Ademas, las tablas de hechos usan restricciones de unicidad y `ON CONFLICT DO NOTHING`.

## 5. Transformaciones comunes

### Conversion de fecha a `date_key`

Las fechas de Firestore pueden venir como `Timestamp`, `Date` o `string`. La ETL las convierte a `Date` y luego genera una llave numerica:

```text
2026-05-30 -> 20260530
```

Esa llave se usa en `dim_date` y en las tablas de hechos.

### Creacion de fecha en `dim_date`

Cada evento necesita una fecha analitica. Si la fecha no existe en la dimension, se crea:

```sql
INSERT INTO dim_date (
  date_key,
  full_date,
  day,
  month,
  month_name,
  quarter,
  year,
  weekday,
  weekday_name
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (date_key) DO NOTHING;
```

Esta dimension permite agrupar por dia, mes, trimestre, anio y dia de la semana.

### Conversion de IDs operacionales a llaves surrogate

Firestore maneja IDs tipo texto:

```text
vehicleId = "abc123"
userId = "uid456"
brandId = "toyota"
```

El Data Warehouse usa llaves numericas:

```text
vehicle_key = 10
user_key = 5
brand_key = 2
```

Esto es una practica normal en bodegas de datos porque mejora la relacion entre dimensiones y hechos.

### Normalizacion de numeros

Campos como precio, kilometraje, plazo o tasa pueden venir como numero o como texto. La ETL intenta convertirlos a numero y, si no son validos, guarda `NULL`.

## 6. ETL de usuarios

### Extract

Origen en Firestore:

```text
users
```

Campos usados:

```text
doc.id       -> firebase_uid
displayName  -> name
email        -> email
role         -> role
```

La carga usa paginacion por ID del documento:

```text
orderBy(documentId()).limit(limit).startAfter(after)
```

### Transform

Reglas:

- El ID del documento se convierte en `firebase_uid`.
- Si `displayName` viene vacio, se guarda como `NULL`.
- Si `email` viene vacio, se guarda como `NULL`.
- Si `role` no existe, se usa `customer`.

### Load

Destino:

```text
dim_users
```

SQL:

```sql
INSERT INTO dim_users (firebase_uid, name, email, role, updated_at)
VALUES ($1, $2, $3, $4, NOW())
ON CONFLICT (firebase_uid) DO UPDATE SET
  name = COALESCE(EXCLUDED.name, dim_users.name),
  email = COALESCE(EXCLUDED.email, dim_users.email),
  role = COALESCE(EXCLUDED.role, dim_users.role),
  updated_at = NOW()
RETURNING user_key;
```

### Para sustentar

Esta ETL convierte los usuarios operacionales de Firebase en una dimension analitica. Permite medir actividad por usuario, usuarios con mayor intencion de compra y comportamiento por rol.

## 7. ETL de marcas

### Extract

Origen en Firestore:

```text
brands
```

Campos usados:

```text
doc.id -> firestore_brand_id
name   -> brand_name
```

### Transform

Reglas:

- El ID del documento se conserva como identificador operacional.
- Si la marca no tiene `name`, se usa el ID del documento como nombre.

### Load

Destino:

```text
dim_brands
```

SQL:

```sql
INSERT INTO dim_brands (firestore_brand_id, brand_name, updated_at)
VALUES ($1, $2, NOW())
ON CONFLICT (firestore_brand_id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  updated_at = NOW()
RETURNING brand_key;
```

### Para sustentar

Esta dimension permite analizar popularidad y conversion por marca. Es la base de tableros como popularidad por marca y conversion de vistas a simulaciones.

## 8. ETL de vehiculos

### Extract

Origen en Firestore:

```text
vehicles
```

Campos usados:

```text
doc.id        -> firestore_vehicle_id
brandId       -> relacion con dim_brands
model         -> model
type          -> type
year          -> year
price         -> price
mileage       -> mileage
fuelType      -> fuel_type
transmission  -> transmission
seats         -> seats
engine        -> engine
```

### Transform

Reglas:

- `brandId` se transforma en `brand_key`.
- `year`, `price`, `mileage` y `seats` se convierten a numero.
- Si el modelo no existe, se usa el ID del documento como respaldo.
- Si la marca aun no existe en `dim_brands`, se crea automaticamente.

### Load

Destino:

```text
dim_vehicles
```

SQL:

```sql
INSERT INTO dim_vehicles (
  firestore_vehicle_id,
  model,
  brand_key,
  type,
  year,
  price,
  mileage,
  fuel_type,
  transmission,
  seats,
  engine,
  updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
ON CONFLICT (firestore_vehicle_id) DO UPDATE SET
  model = EXCLUDED.model,
  brand_key = EXCLUDED.brand_key,
  type = EXCLUDED.type,
  year = EXCLUDED.year,
  price = EXCLUDED.price,
  mileage = EXCLUDED.mileage,
  fuel_type = EXCLUDED.fuel_type,
  transmission = EXCLUDED.transmission,
  seats = EXCLUDED.seats,
  engine = EXCLUDED.engine,
  updated_at = NOW()
RETURNING vehicle_key;
```

### Para sustentar

Esta ETL transforma el catalogo operacional de vehiculos en una dimension central de analisis. Gracias a ella se pueden comparar vehiculos por precio, tipo, marca, modelo, combustible y otras caracteristicas.

## 9. ETL de vistas de vehiculos

### Extract

Origen en Firestore:

```text
vehicle_views
```

Filtro:

```text
syncedToWarehouse == false
```

Campos usados:

```text
doc.id     -> firestore_event_id
userId     -> usuario que vio el vehiculo
vehicleId  -> vehiculo visto
viewedAt   -> fecha real de la vista
```

### Transform

Reglas:

- `userId` se transforma en `user_key`.
- `vehicleId` se transforma en `vehicle_key`.
- Desde el vehiculo se obtiene `brand_key`.
- `viewedAt` se transforma en `date_key`.
- El tipo de interaccion queda como `view`.
- `interaction_count` siempre vale `1`.

### Load

Destino:

```text
fact_interactions
```

SQL:

```sql
INSERT INTO fact_interactions (
  firestore_event_id,
  user_key,
  vehicle_key,
  brand_key,
  date_key,
  interaction_type,
  interaction_count,
  event_timestamp
)
VALUES ($1, $2, $3, $4, $5, $6, 1, $7)
ON CONFLICT (firestore_event_id) DO NOTHING;
```

Valores principales:

```text
interaction_type = 'view'
event_timestamp = viewedAt
```

Luego se marca el documento como sincronizado:

```ts
{
  syncedToWarehouse: true,
  syncedAt: serverTimestamp()
}
```

### Para sustentar

Esta ETL captura el interes inicial del usuario. Las vistas permiten saber que vehiculos llaman mas la atencion, que marcas tienen mayor trafico y como evoluciona la actividad por fecha.

## 10. ETL de favoritos

### Extract

Origen en Firestore:

```text
favorites
```

Filtro:

```text
syncedToWarehouse == false
```

Campos usados:

```text
doc.id     -> firestore_event_id
userId     -> usuario que guardo el vehiculo
vehicleId  -> vehiculo guardado
createdAt  -> fecha en la que se agrego a favoritos
```

### Transform

Reglas:

- `userId` se transforma en `user_key`.
- `vehicleId` se transforma en `vehicle_key`.
- Desde el vehiculo se obtiene `brand_key`.
- `createdAt` se transforma en `date_key`.
- El tipo de interaccion queda como `favorite`.
- `interaction_count` siempre vale `1`.

### Load

Destino:

```text
fact_interactions
```

SQL:

```sql
INSERT INTO fact_interactions (
  firestore_event_id,
  user_key,
  vehicle_key,
  brand_key,
  date_key,
  interaction_type,
  interaction_count,
  event_timestamp
)
VALUES ($1, $2, $3, $4, $5, $6, 1, $7)
ON CONFLICT (firestore_event_id) DO NOTHING;
```

Valores principales:

```text
interaction_type = 'favorite'
event_timestamp = createdAt
```

### Nota importante sobre favoritos

En el proyecto, `favorites` representa los favoritos actuales del usuario, no un historial completo de agregar y quitar favoritos.

Eso significa:

- Si un usuario agrega un favorito, la ETL lo puede cargar como evento `favorite`.
- Si el usuario elimina el favorito despues, el documento puede desaparecer o cambiar en Firebase.
- El Data Warehouse conserva el evento historico que ya fue cargado.

Para analisis esto es valido porque la bodega guarda el hecho ocurrido en el tiempo. Sin embargo, si se quisiera auditar cada accion de agregar y quitar favoritos, lo ideal seria crear una coleccion adicional tipo `favorite_events`.

### Para sustentar

Esta ETL mide una intencion mayor que una vista. Guardar un vehiculo como favorito indica que el usuario tiene interes mas fuerte en ese modelo o marca.

## 11. ETL de comparaciones

### Extract

Origen en Firestore:

```text
vehicle_comparisons
```

Filtro:

```text
syncedToWarehouse == false
```

Campos usados:

```text
doc.id           -> firestore_comparison_id
userId           -> usuario que comparo
firstVehicleId   -> primer vehiculo
secondVehicleId  -> segundo vehiculo
comparedAt       -> fecha de comparacion
```

### Transform

Esta ETL genera dos cargas:

1. Un evento general de comparacion en `fact_interactions`.
2. Dos registros detallados en `fact_comparison_vehicles`, uno por cada vehiculo comparado.

Reglas:

- `userId` se transforma en `user_key`.
- `firstVehicleId` y `secondVehicleId` se transforman en `vehicle_key`.
- La marca de cada vehiculo se transforma en `brand_key`.
- `comparedAt` se transforma en `date_key`.
- En `fact_interactions`, la comparacion se registra con `interaction_type = 'compare'`.

### Load 1: evento general

Destino:

```text
fact_interactions
```

SQL:

```sql
INSERT INTO fact_interactions (
  firestore_event_id,
  user_key,
  vehicle_key,
  brand_key,
  date_key,
  interaction_type,
  interaction_count,
  event_timestamp
)
VALUES ($1, $2, $3, $4, $5, $6, 1, $7)
ON CONFLICT (firestore_event_id) DO NOTHING;
```

Valores principales:

```text
interaction_type = 'compare'
vehicle_key = primer vehiculo comparado
event_timestamp = comparedAt
```

### Load 2: detalle de vehiculos comparados

Destino:

```text
fact_comparison_vehicles
```

SQL:

```sql
INSERT INTO fact_comparison_vehicles (
  firestore_comparison_id,
  user_key,
  vehicle_key,
  brand_key,
  date_key,
  compared_at
)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (firestore_comparison_id, vehicle_key) DO NOTHING;
```

Para cada comparacion se insertan dos filas:

```text
comparacion X - vehiculo A
comparacion X - vehiculo B
```

### Para sustentar

Esta ETL permite analizar que vehiculos compiten entre si. Tambien permite detectar modelos que no solo se ven, sino que entran en una etapa de evaluacion activa por parte del usuario.

## 12. ETL de simulaciones de credito

### Extract

Origen en Firestore:

```text
credit_simulations
```

Filtro:

```text
syncedToWarehouse == false
```

Campos usados:

```text
doc.id                    -> firestore_simulation_id
userId                    -> usuario que simulo
vehicleId                 -> vehiculo simulado
vehiclePrice              -> precio del vehiculo
downPayment               -> cuota inicial
amountFinanced            -> monto financiado
termMonths                -> plazo en meses
interestRate              -> tasa de interes
estimatedMonthlyPayment   -> cuota mensual estimada
simulatedAt               -> fecha de simulacion
```

### Transform

Reglas:

- `userId` se transforma en `user_key`.
- `vehicleId` se transforma en `vehicle_key`.
- Desde el vehiculo se obtiene `brand_key`.
- `simulatedAt` se transforma en `date_key`.
- Los valores financieros se convierten a numero.

### Load

Destino:

```text
fact_credit_simulations
```

SQL:

```sql
INSERT INTO fact_credit_simulations (
  firestore_simulation_id,
  user_key,
  vehicle_key,
  brand_key,
  date_key,
  vehicle_price,
  down_payment,
  amount_financed,
  term_months,
  interest_rate,
  estimated_monthly_payment,
  simulated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
ON CONFLICT (firestore_simulation_id) DO NOTHING;
```

### Para sustentar

Esta es una de las ETL mas importantes para negocio porque representa alta intencion de compra. Un usuario que simula credito ya paso de mirar o comparar a evaluar si puede pagar el vehiculo.

## 13. Relacion entre ETL y tableros

| Tablero | Tablas principales | ETL que lo alimenta |
| --- | --- | --- |
| Resumen general | `fact_interactions`, `fact_credit_simulations`, `dim_users`, `dim_vehicles` | Todas |
| Popularidad por marca | `fact_interactions`, `fact_credit_simulations`, `dim_brands` | Vistas, favoritos, comparaciones, simulaciones |
| Popularidad por vehiculo | `fact_interactions`, `fact_credit_simulations`, `dim_vehicles`, `dim_brands` | Vistas, favoritos, comparaciones, simulaciones |
| Interacciones por fecha | `fact_interactions`, `dim_date` | Vistas, favoritos, comparaciones |
| Simulaciones de credito | `fact_credit_simulations`, `dim_date`, `dim_vehicles` | Simulaciones de credito |
| Embudo de compra | `fact_interactions`, `fact_credit_simulations` | Vistas, favoritos, comparaciones, simulaciones |
| Usuarios con alta intencion | `fact_interactions`, `fact_credit_simulations`, `dim_users` | Todas las interacciones |
| Vehiculos vistos sin conversion | `fact_interactions`, `fact_credit_simulations`, `dim_vehicles` | Vistas y simulaciones |

## 14. Score de popularidad

Para dar mas valor analitico al tablero, las interacciones no pesan igual.

Formula usada:

```text
Score = vistas * 1 + comparaciones * 3 + favoritos * 4 + simulaciones de credito * 5
```

Interpretacion:

- Una vista indica interes inicial.
- Una comparacion indica evaluacion activa.
- Un favorito indica interes sostenido.
- Una simulacion de credito indica intencion fuerte de compra.

Por eso, una marca o vehiculo con menos vistas pero muchas simulaciones puede tener mejor score que uno con muchas vistas pero poca conversion.

## 15. Ejemplo completo de flujo

### Caso

Un usuario ve un Toyota Corolla, lo guarda como favorito, lo compara con otro vehiculo y luego simula credito.

### En Firestore

Se generan documentos en:

```text
vehicle_views
favorites
vehicle_comparisons
credit_simulations
```

Cada documento nace con:

```text
syncedToWarehouse = false
```

### Al ejecutar la ETL

La ETL:

1. Crea o actualiza el usuario en `dim_users`.
2. Crea o actualiza Toyota en `dim_brands`.
3. Crea o actualiza Corolla en `dim_vehicles`.
4. Crea la fecha del evento en `dim_date`.
5. Inserta las interacciones en `fact_interactions`.
6. Inserta el detalle de comparacion en `fact_comparison_vehicles`.
7. Inserta la simulacion en `fact_credit_simulations`.
8. Marca los documentos operacionales como sincronizados.

### En los tableros

Ese comportamiento aumenta:

- Vistas del vehiculo.
- Popularidad de la marca.
- Conteo de favoritos.
- Conteo de comparaciones.
- Conversion de simulaciones.
- Score de popularidad.
- Actividad del usuario.

## 16. Control de duplicados

La ETL evita duplicados de dos formas.

Primero, en Firestore solo lee eventos pendientes:

```text
syncedToWarehouse == false
```

Segundo, en PostgreSQL usa `ON CONFLICT DO NOTHING` en tablas de hechos.

Ejemplo:

```sql
ON CONFLICT (firestore_event_id) DO NOTHING;
```

Esto significa que si por algun motivo se corre dos veces la misma ETL sobre el mismo evento, PostgreSQL no duplica el registro.

## 17. Diferencia entre dimensiones y hechos

### Dimensiones

Las dimensiones describen entidades:

```text
dim_users
dim_brands
dim_vehicles
dim_date
```

Se pueden actualizar porque describen el estado mas reciente de la entidad. Por ejemplo, si cambia el precio de un vehiculo, la dimension se actualiza.

### Hechos

Los hechos registran eventos:

```text
fact_interactions
fact_comparison_vehicles
fact_credit_simulations
```

Normalmente no se actualizan, porque representan algo que ocurrio en un momento especifico.

## 18. Consideraciones para favoritos

La ETL de favoritos usa `createdAt` como fecha del evento.

Si un favorito se cargo antes con una fecha incorrecta y luego se corrige en Firestore, al correr la ETL otra vez no se actualizara automaticamente en PostgreSQL porque:

```sql
ON CONFLICT (firestore_event_id) DO NOTHING
```

Para corregir historicos ya cargados hay dos opciones:

1. Borrar esos favoritos de `fact_interactions` y volver a ejecutar la ETL.
2. Cambiar la estrategia a `ON CONFLICT DO UPDATE` para permitir correcciones.

Para la sustentacion se puede explicar asi:

> La bodega conserva eventos historicos. Para evitar duplicados usamos carga incremental y llaves unicas. Si se necesita reprocesar historicos corregidos, se ejecuta una etapa de reproceso controlado.

## 19. SQL de reproceso controlado para favoritos

Si se necesita volver a cargar favoritos porque se corrigio `createdAt` en Firestore, se puede limpiar solo esa parte del Data Warehouse:

```sql
DELETE FROM fact_interactions
WHERE interaction_type = 'favorite';
```

Luego en Firestore los favoritos deben estar con:

```text
syncedToWarehouse = false
```

Y se ejecuta:

```http
POST /api/admin/warehouse/run-etl/favorites?limit=500
```

## 20. Argumento de sustentacion

La solucion demuestra un enfoque de Data Warehouse porque separa claramente la base operacional de la base analitica.

Firestore esta optimizado para la aplicacion diaria: guardar usuarios, vehiculos e interacciones en tiempo real. PostgreSQL/Supabase esta optimizado para analisis: organizar dimensiones y hechos, consultar historicos, calcular agregados y alimentar tableros.

La ETL es el puente entre ambas capas. Extrae eventos operacionales, los transforma a un modelo dimensional y los carga en tablas de hechos que permiten responder preguntas de negocio:

- Que marcas son mas populares.
- Que vehiculos generan mayor intencion.
- Que usuarios estan mas cerca de comprar.
- Como evoluciona la actividad por fecha.
- Que rango de precios tiene mejor conversion.
- Que vehiculos se ven mucho pero no convierten.

Esto cumple el enfoque de la asignatura porque no solo se guardan datos, sino que se disena una arquitectura para convertir datos operacionales en informacion util para la toma de decisiones.

