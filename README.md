# EstacionamientoApp

Aplicación móvil para guardar varias ubicaciones donde se estacionó el auto.
La persona puede crear una cuenta, iniciar sesión, registrar la ubicación
actual, cambiarle el nombre, abrirla en Google Maps y eliminarla.

La app está hecha con React Native, Expo y TypeScript. Los datos se guardan en
el dispositivo; el proyecto no utiliza un servidor ni sincroniza la información
entre dispositivos.

## Funcionalidades

- Registro con correo y contraseña.
- Inicio y cierre de sesión.
- Validación de campos, formato del correo, longitud mínima de contraseña y
coincidencia de confirmación al registrarse.
- Recuperación de la sesión cuando se vuelve a abrir la app.
- Navegación Stack entre el acceso y la pantalla de estacionamientos.
- Solicitud de permiso para obtener la ubicación del dispositivo mientras se
usa la app.
- Listado dinámico de estacionamientos con FlatList.
- Alta de ubicaciones desde el GPS, edición del nombre y eliminación.
- Guardado de latitud, longitud y hora de cada registro.
- Apertura de las coordenadas guardadas en Google Maps.

## Tecnologías y dependencias principales

- **Expo y React Native:** estructura y ejecución de la aplicación móvil.
- **TypeScript:** tipos para los datos de usuario y ubicación.
- **Expo Router:** navegación Stack entre las pantallas de acceso y la lista.
- **AsyncStorage:** almacenamiento local de cuentas, sesión y ubicación.
- **Expo SecureStore:** almacenamiento local de las contraseñas en Android e
  iOS. En web, las contraseñas se guardan en AsyncStorage del navegador porque
  SecureStore no está disponible en esa plataforma.
- **Expo Location:** solicitud de permiso y lectura de la ubicación actual.

## Requisitos

- Node.js y npm instalados.
- Un dispositivo Android o un emulador Android para probar la aplicación.
- Para probar en un teléfono, Expo Go compatible con la versión de Expo del
  proyecto.
- La ubicación del dispositivo activada y permiso de ubicación concedido para
  guardar dónde se estacionó el auto.

## Instalación y ejecución

Desde una terminal, entra a la carpeta del proyecto:

```bash
cd estacionamientoApp
```

Instala las dependencias (si todavía no están instaladas) y arranca Expo:

```bash
npm install
npm run start
```

Expo mostrará un código QR y opciones para abrir la app. Para iniciar
directamente en Android también se puede usar:

```bash
npm run android
```

Los comandos `npm run ios` y `npm run web` están definidos en el proyecto. La
ejecución nativa de iOS requiere macOS y Xcode. La ubicación depende de las
capacidades disponibles en la plataforma y el dispositivo.

Para iniciar directamente la versión web:

```bash
npm run web
```

En un navegador, la geolocalización suele requerir que la app se ejecute en
`localhost` o mediante HTTPS, y que el navegador permita compartir la ubicación.

## Cómo se usa

1. Al abrir la app aparece la pantalla de inicio de sesión. Desde allí se puede
   cambiar al formulario de creación de cuenta.
2. Para registrarse hay que ingresar un correo válido, una contraseña de al
   menos seis caracteres y repetirla correctamente.
3. Al crear la cuenta, la sesión se inicia automáticamente. En adelante, la app
   intenta recuperar la sesión guardada al abrirse.
4. En el panel principal, **Guardar ubicación actual** solicita permiso y
   agrega las coordenadas del dispositivo a la lista.
5. Cada estacionamiento muestra sus coordenadas y hora. Se puede cambiar su
   nombre con **Editar**, abrir sus coordenadas con **Ver mapa** o quitarlo con
   **Eliminar**.
6. **Cerrar sesión** vuelve a la pantalla de acceso. La ubicación guardada no
   se elimina al cerrar sesión.

## Organización del código

```text
estacionamientoApp/
├── app.json
├── package.json
└── src/
    ├── app/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── login.tsx
    │   └── parking.tsx
    ├── components/
    │   ├── Dashboard.tsx
    │   ├── LoadingScreen.tsx
    │   ├── Login.tsx
    │   └── ParkingList.tsx
    ├── context/
    │   └── AppContext.tsx
    └── types/
        └── index.ts
```

- **`src/app/_layout.tsx`:** configura el Stack y comparte el estado de la app.
- **`src/app/index.tsx`:** envía al usuario a la pantalla de acceso o al panel
  según su sesión.
- **`src/app/login.tsx` y `src/app/parking.tsx`:** rutas del acceso y del panel.
- **`src/context/AppContext.tsx`:** carga la sesión y guarda las cuentas y
  ubicaciones en el dispositivo.
- **`src/components/Login.tsx`:** formularios de acceso y registro, validación
  de datos y presentación de errores.
- **`src/components/Dashboard.tsx`:** pantalla principal para una sesión
  iniciada. Muestra el correo y permite cerrar sesión.
- **`src/components/ParkingList.tsx`:** muestra los estacionamientos con
  FlatList y permite agregarlos, editar sus nombres y eliminarlos.
- **`src/types/index.ts`:** define los tipos `User` y `Location` que comparten
  las pantallas.
- **`app.json`:** configuración de Expo y plugins de SecureStore y Router.
- **`package.json`:** dependencias y comandos para ejecutar el proyecto.

## Datos guardados

La app almacena la lista de cuentas y la sesión en AsyncStorage. Cada cuenta
tiene un identificador y un correo. En Android e iOS, la contraseña se guarda
por separado en SecureStore; en web se usa AsyncStorage, que no ofrece el mismo
nivel de protección, por lo que la versión web es para demostración y no se
deben usar contraseñas reales o reutilizadas. Cada ubicación se guarda asociada
al correo de la cuenta y contiene nombre, latitud, longitud y hora. Los datos
permanecen en el almacenamiento local y no se envían a un servicio remoto.

## Consideraciones

- Si se desinstala la app o se borran sus datos, la información local puede
  perderse.
- La ubicación requiere autorización del usuario. Si se deniega el permiso, no
  se puede guardar la posición actual.
- El enlace de Google Maps necesita conexión a internet para mostrar el mapa.
- Este proyecto es una aplicación local de demostración: no cuenta con
  recuperación de contraseña, backend ni sincronización de cuentas.
