# ANTSV — Frontend

Interfaz de administración desarrollada con Angular 17, PrimeNG 17 y TypeScript.

Incluye inicio de sesión, identidad electrónica, recuperación de contraseña, perfil, usuarios, roles, permisos, auditoría, notificaciones y tipos de documento. La ruta inicial es `/perfil`; los componentes de archivos y formularios dinámicos se reutilizan dentro de otras pantallas.

## Requisitos

- Node.js y npm compatibles con el Angular CLI instalado. Su declaración local admite `^18.13.0 || >=20.9.0`.
- Backend ANTSV configurado y disponible para autenticación y consultas.

Ejecutar los comandos desde la raíz de este proyecto.

## Instalación y desarrollo

```sh
npm ci
npm start
```

Abrir `http://localhost:4500`. `npm start` ejecuta `start:local`, que utiliza la configuración `development` y escucha en `0.0.0.0:4500`.

Los scripts de desarrollo cargan [proxy.config.json](proxy.config.json): las solicitudes `/api/*` se envían a `http://localhost:8085/`. Ajustar su destino si el backend utiliza otro host o puerto.

## Entornos

| Entorno | Archivo | Servidor de desarrollo | Compilación |
| --- | --- | --- | --- |
| Local | `src/environments/environment.ts` | `npm run start:local` | `npm run build:local` |
| Test | `src/environments/environment.test.ts` | `npm run start:test` | `npm run build:test` |
| Producción | `src/environments/environment.prod.ts` | `npm run start:prod` | `npm run build:prod` |

Los archivos de entorno definen `production`, `frontLandingUrl` y `lista_roles_admin`. Revisar las URL y los roles permitidos para la instalación de ANTSV. Los valores actuales incluyen direcciones heredadas.

Todos los comandos `start:*` utilizan el mismo proxy local. Cambiar el entorno no cambia automáticamente el backend de destino. `start:prod` ejecuta el servidor de desarrollo con la configuración de producción; para desplegar, generar y publicar los archivos compilados.

## Compilación y despliegue

```sh
npm run build:local
npm run build:prod
```

`npm run build` equivale a `npm run build:prod`. La salida se genera en `dist/ultima-ng`, nombre que todavía conserva la configuración de Angular.

Publicar ese directorio en el servidor web, configurar el reenvío de `/api` al backend y la resolución de rutas de Angular mediante `index.html`. El proxy de desarrollo no se incluye en la compilación publicada.

## Pruebas

```sh
npx tsc -p tsconfig.spec.json --noEmit
npm test
```

El primer comando verifica los tipos de las pruebas sin ejecutarlas. `npm test` ejecuta Karma y requiere un navegador disponible según `karma.conf.js`. La validación funcional de login, permisos y archivos requiere el backend y sus servicios.

## Estructura

```text
src/app/           Pantallas, layout, servicios y componentes compartidos
src/assets/        Imágenes, estilos y temas
src/environments/  Configuración por entorno
proxy.config.json  Conexión con la API durante el desarrollo
angular.json       Configuración de compilación y pruebas
```

Consultar [TEMPLATE_BASE.md](TEMPLATE_BASE.md) para los módulos conservados y los contratos que aún dependen de organizaciones. Personalizar logos, recursos de login e identidad visual para la instalación de ANTSV.
