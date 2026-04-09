# 🛠️ Configuración del entorno del proyecto

Este proyecto utiliza **Node.js** gestionado con **NVM** y el workspace está construido con **Nx**.

Sigue estos pasos **en orden** antes de intentar ejecutar el proyecto.


## 1️⃣ Instalar NVM para Windows

Descarga e instala NVM desde:

👉 https://github.com/coreybutler/nvm-windows/releases

Ejecuta el instalador: nvm-setup.exe


Cierra y vuelve a abrir la terminal después de la instalación.

## 2️⃣ Instalar la versión correcta de Node

Este proyecto requiere **Node v24.14.1**.

En la terminal ejecuta:

```bash
nvm install 24.14.1
nvm use 24.14.1
```

Verifica que quedó correctamente instalado:

```bash
node --version
```

Debe mostrar:

```bash
v24.14.1
```

## 3️⃣ Instalar Nx globalmente

Nx se usa para manejar el workspace del proyecto.

```bash
npm install -g nx
```

Verifica:

```bash
nx --version
```

##4️⃣ Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd <NOMBRE_DEL_PROYECTO>
```

5️⃣ Instalar dependencias del proyecto

Dentro de la carpeta del proyecto:

```bash
npm install
```

## 6️⃣ Ejecutar el proyecto

```bash
npm run start
```

# Backend

Para generar modulos se debe estar en la carpeta del backend "ehm_back", ejecutar:

```bash
cd apps/ehm_back
```
### Crear modulo

```bash
nest g module name
```

### Crear servicio

```bash
nest g service name --no-spec
```

### Crear controlador

```bash
nest g controller name --no-spec
```