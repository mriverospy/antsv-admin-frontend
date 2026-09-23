# Frontend base

## Módulos conservados

- Usuarios, perfiles/roles y asignación de permisos.
- Inicio de sesión, callback de identidad electrónica y recuperación de contraseña.
- Mi Perfil: información personal, seguridad y preferencias de notificaciones.
- Auditoría, notificaciones y tipos de documento.
- Archivos y formularios dinámicos como componentes compartidos.
- Layout, servicios de sesión e interceptores HTTP.

La ruta inicial es `/perfil`. `/home`, `/tablero-general` y `/mi-perfil` redirigen allí por compatibilidad. Se eliminaron las pantallas de cursos, eventos, mentorías, programas, postulaciones, indicadores, productos, organizaciones, portal y registro público, junto con sus rutas y entradas del menú.

## Dependencias del backend que se mantienen

Usuarios todavía consulta organizaciones y métodos de registro. La sesión incluye una organización y el perfil usa esos datos. Se mantienen los modelos y servicios necesarios para respetar el contrato actual; eliminar esos campos requiere adaptar también el backend.

Archivos se utiliza mediante `app-archivo-list` y `app-archivo-form` dentro de una pantalla que provea `idRecurso`, `idEntity` y `tipoRecurso`. No se publica una ruta global de Archivos: el backend devuelve una lista vacía si no recibe `idRecurso`. Al reutilizar el formulario se debe proporcionar el tipo de recurso correspondiente.

Se conservan los estilos, temas y recursos visuales existentes. La personalización de logos, video de login, identidad electrónica y entornos debe realizarse para cada aplicación nueva.

## Verificación

```sh
npm run build:local
npm run build:prod
npx tsc -p tsconfig.spec.json --noEmit
```

La compilación de pruebas comprueba tipos; no sustituye la ejecución de Karma ni la validación funcional con una sesión y un backend disponibles.
