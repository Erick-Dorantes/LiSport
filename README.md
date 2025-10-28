# LiSport - Catálogo de Ropa Deportiva

## Instalación en Hostinger

### 1. Subir Archivos

- Sube todos los archivos a tu hosting manteniendo la estructura de carpetas
- Asegúrate de que los permisos de la carpeta `public/images/` sean 755

### 2. Configurar Base de Datos

1. Ve al panel de control de Hostinger
2. Crea una base de datos MongoDB
3. Anota la cadena de conexión

### 3. Configurar Variables de Entorno

En el archivo `server/index.js`, actualiza:

```javascript
mongoose.connect('TU_CADENA_DE_CONEXION_MONGODB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
```
