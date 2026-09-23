# minna-frontend


## Estructura de Archivos

```
src/environments/
├── environment.ts          # LOCAL (development) - por defecto
├── environment.test.ts     # TEST
└── environment.prod.ts     # PRODUCCIÓN
```

### Run project

```bash
npm start              # Ambiente LOCAL
npm run start:local    # Ambiente LOCAL
npm run start:test     # Ambiente TEST  
npm run start:prod     # Ambiente PROD
```

# Compilación

```bash
npm run build
npm run build:local    # Build para LOCAL
npm run build:test     # Build para TEST
npm run build:prod     # Build para PRODUCCIÓN
```