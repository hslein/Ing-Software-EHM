# Modelo de datos para diagrama entidad-relacion

Este documento resume las colecciones de Firebase/Firestore y las tablas del Data Warehouse en PostgreSQL/Supabase usadas en el proyecto EHM. Sirve como base para construir el modelo entidad-relacion y explicar la arquitectura de datos en la sustentacion.

> Nota: Firestore no maneja tipos SQL estrictos. En la seccion de Firestore se usan tipos logicos equivalentes para modelado: `string`, `number`, `boolean`, `timestamp`, etc. En PostgreSQL se proponen tipos SQL compatibles con Supabase/PostgreSQL segun la ETL y las consultas implementadas.

## 1. Base operacional: Firebase / Firestore

La base operacional almacena los datos de uso diario de la aplicacion. Estas colecciones son la fuente de datos que luego alimenta el Data Warehouse mediante ETL.

## 1.1 Coleccion `users`

Representa los usuarios registrados en la aplicacion.

| Campo | Tipo logico | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `id` / document id | `string` | Si | UID de Firebase. Identificador del usuario. |
| `email` | `string` | No | Correo electronico del usuario. |
| `displayName` | `string` | No | Nombre visible del usuario. |
| `birthdate` | `string` | No | Fecha de nacimiento, si se captura. |
| `role` | `string` | No | Rol del usuario: `admin` o `customer`. |
| `createdAt` | `timestamp` | No | Fecha de creacion del usuario. |
| `updatedAt` | `timestamp` | No | Fecha de ultima actualizacion. |

Relaciones logicas:

- `users.id` se relaciona con `vehicle_views.userId`.
- `users.id` se relaciona con `favorites.userId`.
- `users.id` se relaciona con `vehicle_comparisons.userId`.
- `users.id` se relaciona con `credit_simulations.userId`.

## 1.2 Coleccion `brands`

Representa las marcas de vehiculos.

| Campo | Tipo logico | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `id` / document id | `string` | Si | Identificador de la marca en Firestore. |
| `name` | `string` | Si | Nombre de la marca. |
| `image` | `string` | Si | URL o ruta de imagen de la marca. |
| `createdAt` | `timestamp` | No | Fecha de creacion. |
| `updatedAt` | `timestamp` | No | Fecha de actualizacion. |

Relaciones logicas:

- `brands.id` se relaciona con `vehicles.brandId`.

## 1.3 Coleccion `vehicles`

Representa el catalogo de vehiculos.

| Campo | Tipo logico | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `id` / document id | `string` | Si | Identificador del vehiculo en Firestore. |
| `model` | `string` | Si | Modelo del vehiculo. |
| `brandId` | `string` | Si | Referencia logica a `brands.id`. |
| `type` | `string` | Si | Tipo de vehiculo: `suv`, `sedan`, `deportivo` o `pickup`. |
| `image` | `string` | Si | URL o ruta de imagen del vehiculo. |
| `description` | `string` | Si | Descripcion comercial del vehiculo. |
| `price` | `number` | No | Precio del vehiculo. |
| `year` | `number` | No | Anio del vehiculo. |
| `mileage` | `number` | No | Kilometraje. |
| `fuelType` | `string` | No | Tipo de combustible. |
| `transmission` | `string` | No | Tipo de transmision. |
| `seats` | `number` | No | Numero de asientos. |
| `engine` | `string` | No | Motor o referencia tecnica. |
| `isFavorite` | `boolean` | No | Campo de apoyo visual, no se usa como hecho historico. |
| `createdAt` | `timestamp` | No | Fecha de creacion. |
| `updatedAt` | `timestamp` | No | Fecha de actualizacion. |

Relaciones logicas:

- `vehicles.brandId` se relaciona con `brands.id`.
- `vehicles.id` se relaciona con `vehicle_views.vehicleId`.
- `vehicles.id` se relaciona con `favorites.vehicleId`.
- `vehicles.id` se relaciona con `vehicle_comparisons.firstVehicleId`.
- `vehicles.id` se relaciona con `vehicle_comparisons.secondVehicleId`.
- `vehicles.id` se relaciona con `credit_simulations.vehicleId`.

## 1.4 Coleccion `vehicle_views`

Registra cuando un usuario visualiza un vehiculo.

| Campo | Tipo logico | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `id` / document id | `string` | Si | Identificador del evento de vista. |
| `userId` | `string` | Si | Usuario que vio el vehiculo. |
| `vehicleId` | `string` | Si | Vehiculo visto. |
| `brandId` | `string` | No | Marca del vehiculo, si se guarda de forma redundante. |
| `viewedAt` | `timestamp` | No | Fecha y hora de la vista. |
| `syncedToWarehouse` | `boolean` | No | Indica si el evento ya fue enviado al Data Warehouse. |
| `syncedAt` | `timestamp` | No | Fecha de sincronizacion con el Data Warehouse. |

Relaciones logicas:

- `vehicle_views.userId` -> `users.id`.
- `vehicle_views.vehicleId` -> `vehicles.id`.

## 1.5 Coleccion `favorites`

Registra los vehiculos favoritos actuales del usuario.

| Campo | Tipo logico | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `id` / document id | `string` | Si | Identificador del favorito. |
| `userId` | `string` | Si | Usuario que guardo el vehiculo. |
| `vehicleId` | `string` | Si | Vehiculo guardado. |
| `createdAt` | `timestamp` | No | Fecha en que se agrego a favoritos. |
| `syncedToWarehouse` | `boolean` | No | Indica si el favorito ya fue enviado al Data Warehouse. |
| `syncedAt` | `timestamp` | No | Fecha de sincronizacion. |

Relaciones logicas:

- `favorites.userId` -> `users.id`.
- `favorites.vehicleId` -> `vehicles.id`.

Nota para el ER:

- En Firestore funciona como coleccion de estado actual.
- En el Data Warehouse se interpreta como evento analitico de tipo `favorite` cuando se sincroniza.

## 1.6 Coleccion `vehicle_comparisons`

Registra cuando un usuario compara dos vehiculos.

| Campo | Tipo logico | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `id` / document id | `string` | Si | Identificador de la comparacion. |
| `userId` | `string` | Si | Usuario que realizo la comparacion. |
| `firstVehicleId` | `string` | Si | Primer vehiculo comparado. |
| `secondVehicleId` | `string` | Si | Segundo vehiculo comparado. |
| `comparedAt` | `timestamp` | No | Fecha y hora de comparacion. |
| `syncedToWarehouse` | `boolean` | No | Indica si la comparacion ya fue enviada al Data Warehouse. |
| `syncedAt` | `timestamp` | No | Fecha de sincronizacion. |

Relaciones logicas:

- `vehicle_comparisons.userId` -> `users.id`.
- `vehicle_comparisons.firstVehicleId` -> `vehicles.id`.
- `vehicle_comparisons.secondVehicleId` -> `vehicles.id`.

## 1.7 Coleccion `credit_simulations`

Registra simulaciones de credito realizadas por los usuarios sobre vehiculos especificos.

| Campo | Tipo logico | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `id` / document id | `string` | Si | Identificador de la simulacion. |
| `userId` | `string` | Si | Usuario que realizo la simulacion. |
| `vehicleId` | `string` | Si | Vehiculo sobre el que se simulo credito. |
| `vehiclePrice` | `number` | Si | Precio del vehiculo. |
| `downPayment` | `number` | Si | Cuota inicial. |
| `amountFinanced` | `number` | Si | Monto financiado. |
| `termMonths` | `number` | Si | Plazo en meses. |
| `interestRate` | `number` | Si | Tasa de interes usada en la simulacion. |
| `estimatedMonthlyPayment` | `number` | Si | Cuota mensual estimada. |
| `simulatedAt` | `timestamp` | No | Fecha y hora de la simulacion. |
| `syncedToWarehouse` | `boolean` | No | Indica si la simulacion ya fue enviada al Data Warehouse. |
| `syncedAt` | `timestamp` | No | Fecha de sincronizacion. |

Relaciones logicas:

- `credit_simulations.userId` -> `users.id`.
- `credit_simulations.vehicleId` -> `vehicles.id`.

## 1.8 Coleccion `chatbot_queries`

Coleccion modelada en backend, pero omitida del alcance actual del Data Warehouse porque se decidio no trabajar chatbot por ahora.

| Campo | Tipo logico | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `id` / document id | `string` | Si | Identificador de la consulta. |
| `userId` | `string` | No | Usuario que realizo la consulta. |
| `query` | `string` | No | Pregunta del usuario. |
| `response` | `string` | No | Respuesta generada. |
| `vehicleId` | `string` | No | Vehiculo relacionado, si aplica. |
| `createdAt` | `timestamp` | No | Fecha de consulta. |
| `syncedToWarehouse` | `boolean` | No | Campo preparado para futura sincronizacion. |

## 2. Data Warehouse: PostgreSQL / Supabase

El Data Warehouse usa un modelo dimensional. Las dimensiones describen entidades y las tablas de hechos almacenan eventos medibles.

## 2.1 Tabla `dim_users`

Dimension de usuarios.

| Campo | Tipo PostgreSQL | Llave | Descripcion |
| --- | --- | --- | --- |
| `user_key` | `bigserial` / `bigint` | PK | Llave sustituta del usuario. |
| `firebase_uid` | `text` | UK | UID original de Firebase. |
| `name` | `text` |  | Nombre del usuario. |
| `email` | `text` |  | Correo del usuario. |
| `role` | `text` |  | Rol: `admin` o `customer`. |
| `created_at` | `timestamp` |  | Fecha de creacion del registro en DW. |
| `updated_at` | `timestamp` |  | Fecha de actualizacion del registro en DW. |

Relaciones:

- `dim_users.user_key` -> `fact_interactions.user_key`.
- `dim_users.user_key` -> `fact_comparison_vehicles.user_key`.
- `dim_users.user_key` -> `fact_credit_simulations.user_key`.

## 2.2 Tabla `dim_brands`

Dimension de marcas.

| Campo | Tipo PostgreSQL | Llave | Descripcion |
| --- | --- | --- | --- |
| `brand_key` | `bigserial` / `bigint` | PK | Llave sustituta de la marca. |
| `firestore_brand_id` | `text` | UK | ID original de Firestore. |
| `brand_name` | `text` |  | Nombre de la marca. |
| `created_at` | `timestamp` |  | Fecha de creacion en DW. |
| `updated_at` | `timestamp` |  | Fecha de actualizacion en DW. |

Relaciones:

- `dim_brands.brand_key` -> `dim_vehicles.brand_key`.
- `dim_brands.brand_key` -> `fact_interactions.brand_key`.
- `dim_brands.brand_key` -> `fact_comparison_vehicles.brand_key`.
- `dim_brands.brand_key` -> `fact_credit_simulations.brand_key`.

## 2.3 Tabla `dim_vehicles`

Dimension de vehiculos.

| Campo | Tipo PostgreSQL | Llave | Descripcion |
| --- | --- | --- | --- |
| `vehicle_key` | `bigserial` / `bigint` | PK | Llave sustituta del vehiculo. |
| `firestore_vehicle_id` | `text` | UK | ID original de Firestore. |
| `model` | `text` |  | Modelo del vehiculo. |
| `brand_key` | `bigint` | FK | Referencia a `dim_brands.brand_key`. |
| `type` | `text` |  | Tipo de vehiculo. |
| `year` | `integer` |  | Anio del vehiculo. |
| `price` | `numeric` |  | Precio. |
| `mileage` | `numeric` |  | Kilometraje. |
| `fuel_type` | `text` |  | Tipo de combustible. |
| `transmission` | `text` |  | Transmision. |
| `seats` | `integer` |  | Numero de asientos. |
| `engine` | `text` |  | Motor. |
| `created_at` | `timestamp` |  | Fecha de creacion en DW. |
| `updated_at` | `timestamp` |  | Fecha de actualizacion en DW. |

Relaciones:

- `dim_vehicles.vehicle_key` -> `fact_interactions.vehicle_key`.
- `dim_vehicles.vehicle_key` -> `fact_comparison_vehicles.vehicle_key`.
- `dim_vehicles.vehicle_key` -> `fact_credit_simulations.vehicle_key`.

## 2.4 Tabla `dim_date`

Dimension de tiempo.

| Campo | Tipo PostgreSQL | Llave | Descripcion |
| --- | --- | --- | --- |
| `date_key` | `integer` | PK | Llave de fecha en formato `YYYYMMDD`. |
| `full_date` | `date` |  | Fecha completa. |
| `day` | `integer` |  | Dia del mes. |
| `month` | `integer` |  | Numero de mes. |
| `month_name` | `text` |  | Nombre del mes. |
| `quarter` | `integer` |  | Trimestre del anio. |
| `year` | `integer` |  | Anio. |
| `weekday` | `integer` |  | Dia de la semana como numero. |
| `weekday_name` | `text` |  | Nombre del dia de la semana. |

Relaciones:

- `dim_date.date_key` -> `fact_interactions.date_key`.
- `dim_date.date_key` -> `fact_comparison_vehicles.date_key`.
- `dim_date.date_key` -> `fact_credit_simulations.date_key`.

## 2.5 Tabla `fact_interactions`

Tabla de hechos para interacciones generales: vistas, favoritos y comparaciones.

| Campo | Tipo PostgreSQL | Llave | Descripcion |
| --- | --- | --- | --- |
| `interaction_key` | `bigserial` / `bigint` | PK | Llave sustituta del hecho. |
| `firestore_event_id` | `text` | UK | ID del evento original en Firestore. |
| `user_key` | `bigint` | FK | Usuario relacionado. |
| `vehicle_key` | `bigint` | FK | Vehiculo relacionado. |
| `brand_key` | `bigint` | FK | Marca relacionada. |
| `date_key` | `integer` | FK | Fecha analitica. |
| `interaction_type` | `text` |  | Tipo: `view`, `favorite` o `compare`. |
| `interaction_count` | `integer` |  | Conteo del evento. Normalmente `1`. |
| `event_timestamp` | `timestamp` |  | Fecha y hora original del evento. |
| `created_at` | `timestamp` |  | Fecha de carga en DW. |

Relaciones:

- `fact_interactions.user_key` -> `dim_users.user_key`.
- `fact_interactions.vehicle_key` -> `dim_vehicles.vehicle_key`.
- `fact_interactions.brand_key` -> `dim_brands.brand_key`.
- `fact_interactions.date_key` -> `dim_date.date_key`.

Eventos cargados:

- `vehicle_views` -> `interaction_type = 'view'`.
- `favorites` -> `interaction_type = 'favorite'`.
- `vehicle_comparisons` -> `interaction_type = 'compare'`.

## 2.6 Tabla `fact_comparison_vehicles`

Tabla de hechos/detalle para registrar cada vehiculo involucrado en una comparacion.

| Campo | Tipo PostgreSQL | Llave | Descripcion |
| --- | --- | --- | --- |
| `comparison_vehicle_key` | `bigserial` / `bigint` | PK | Llave sustituta del detalle. |
| `firestore_comparison_id` | `text` | UK parcial | ID de la comparacion original. |
| `user_key` | `bigint` | FK | Usuario que comparo. |
| `vehicle_key` | `bigint` | FK / UK parcial | Vehiculo incluido en la comparacion. |
| `brand_key` | `bigint` | FK | Marca del vehiculo comparado. |
| `date_key` | `integer` | FK | Fecha analitica. |
| `compared_at` | `timestamp` |  | Fecha y hora original de la comparacion. |
| `created_at` | `timestamp` |  | Fecha de carga en DW. |

Restriccion recomendada:

```sql
UNIQUE (firestore_comparison_id, vehicle_key)
```

Relaciones:

- `fact_comparison_vehicles.user_key` -> `dim_users.user_key`.
- `fact_comparison_vehicles.vehicle_key` -> `dim_vehicles.vehicle_key`.
- `fact_comparison_vehicles.brand_key` -> `dim_brands.brand_key`.
- `fact_comparison_vehicles.date_key` -> `dim_date.date_key`.

## 2.7 Tabla `fact_credit_simulations`

Tabla de hechos para simulaciones de credito.

| Campo | Tipo PostgreSQL | Llave | Descripcion |
| --- | --- | --- | --- |
| `simulation_key` | `bigserial` / `bigint` | PK | Llave sustituta de la simulacion. |
| `firestore_simulation_id` | `text` | UK | ID original de Firestore. |
| `user_key` | `bigint` | FK | Usuario que simulo. |
| `vehicle_key` | `bigint` | FK | Vehiculo simulado. |
| `brand_key` | `bigint` | FK | Marca del vehiculo. |
| `date_key` | `integer` | FK | Fecha analitica. |
| `vehicle_price` | `numeric` |  | Precio del vehiculo. |
| `down_payment` | `numeric` |  | Cuota inicial. |
| `amount_financed` | `numeric` |  | Monto financiado. |
| `term_months` | `integer` |  | Plazo en meses. |
| `interest_rate` | `numeric` |  | Tasa de interes. |
| `estimated_monthly_payment` | `numeric` |  | Cuota mensual estimada. |
| `simulated_at` | `timestamp` |  | Fecha y hora original de la simulacion. |
| `created_at` | `timestamp` |  | Fecha de carga en DW. |

Relaciones:

- `fact_credit_simulations.user_key` -> `dim_users.user_key`.
- `fact_credit_simulations.vehicle_key` -> `dim_vehicles.vehicle_key`.
- `fact_credit_simulations.brand_key` -> `dim_brands.brand_key`.
- `fact_credit_simulations.date_key` -> `dim_date.date_key`.

## 2.8 Vista `vw_brand_popularity`

Vista analitica usada para calcular popularidad por marca.

| Campo | Tipo PostgreSQL | Descripcion |
| --- | --- | --- |
| `brand_key` | `bigint` | Llave de la marca. |
| `brand_name` | `text` | Nombre de la marca. |
| `total_views` | `integer` | Total de vistas. |
| `total_comparisons` | `integer` | Total de comparaciones. |
| `total_favorites` | `integer` | Total de favoritos. |
| `total_credit_simulations` | `integer` | Total de simulaciones de credito. |
| `popularity_score` | `numeric` | Puntaje ponderado de popularidad. |

Formula del score:

```text
popularity_score =
  total_views * 1 +
  total_comparisons * 3 +
  total_favorites * 4 +
  total_credit_simulations * 5
```

## 3. Relaciones principales para el diagrama ER operacional

Estas relaciones aplican al modelo conceptual sobre Firestore:

```text
brands 1 ---- N vehicles

users 1 ---- N vehicle_views
vehicles 1 ---- N vehicle_views

users 1 ---- N favorites
vehicles 1 ---- N favorites

users 1 ---- N vehicle_comparisons
vehicles 1 ---- N vehicle_comparisons (firstVehicleId)
vehicles 1 ---- N vehicle_comparisons (secondVehicleId)

users 1 ---- N credit_simulations
vehicles 1 ---- N credit_simulations
```

## 4. Relaciones principales para el diagrama ER del Data Warehouse

Estas relaciones aplican al modelo dimensional:

```text
dim_brands 1 ---- N dim_vehicles

dim_users 1 ---- N fact_interactions
dim_vehicles 1 ---- N fact_interactions
dim_brands 1 ---- N fact_interactions
dim_date 1 ---- N fact_interactions

dim_users 1 ---- N fact_comparison_vehicles
dim_vehicles 1 ---- N fact_comparison_vehicles
dim_brands 1 ---- N fact_comparison_vehicles
dim_date 1 ---- N fact_comparison_vehicles

dim_users 1 ---- N fact_credit_simulations
dim_vehicles 1 ---- N fact_credit_simulations
dim_brands 1 ---- N fact_credit_simulations
dim_date 1 ---- N fact_credit_simulations
```

## 5. Diferencia entre modelo operacional y modelo analitico

| Aspecto | Firestore operacional | PostgreSQL Data Warehouse |
| --- | --- | --- |
| Proposito | Guardar la operacion diaria de la aplicacion. | Analizar datos historicos y alimentar tableros. |
| Modelo | Documentos y colecciones. | Modelo dimensional con dimensiones y hechos. |
| IDs | IDs de documento tipo texto. | Llaves sustitutas numericas. |
| Consultas | Lectura y escritura de datos de aplicacion. | Agregaciones, rankings, tendencias y conversiones. |
| Actualizacion | Cambia segun acciones del usuario. | Carga controlada mediante ETL. |
| Ejemplo | Un usuario guarda un favorito. | El favorito aumenta el conteo historico de interacciones. |

## 6. Tablas que no pertenecen al modelo EHM

Si en Supabase aparecen tablas como las siguientes, no pertenecen al diseno del proyecto EHM y probablemente vienen de una base de ejemplo:

```text
album
artist
employee
genre
invoice
invoice_line
media_type
playlist
playlist_track
track
track_price_history
```

Las tablas del proyecto EHM son:

```text
dim_users
dim_brands
dim_vehicles
dim_date
fact_interactions
fact_comparison_vehicles
fact_credit_simulations
vw_brand_popularity
agg_brand_popularity
agg_vehicle_popularity
```

Las tablas `agg_brand_popularity` y `agg_vehicle_popularity` pueden considerarse tablas agregadas auxiliares si se usan para materializar resultados de tableros. Si los tableros consultan directamente vistas o queries agregadas, estas tablas pueden explicarse como optimizaciones opcionales.

