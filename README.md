
# Mercado.net

Mercado.net es un proyecto web desarrollado con **ReactJS** y **Vite**. Este sitio tiene como objetivo principal 
ofrecer una plataforma para listar proveedores y aplicar filtros de búsqueda personalizados.

## Características principales

- **Homepage**: Página de inicio con una introducción al proyecto.
- **Listado de Proveedores**: Una sección dedicada para mostrar proveedores con información detallada.
- **Filtrado Avanzado**: Funcionalidad de filtros por:
  - Tipo de proveedor (checkbox, selección única).
  - Ubicación (desplegable).
  - Marca (desplegable).

## Tecnologías utilizadas

- **Frontend**: ReactJS con Vite.
- **Base de datos**: Firebase (Firestore) para almacenamiento de datos.
- **Estilización**: CSS moderno con diseño responsivo.

## Instalación y ejecución

1. Clona este repositorio:
   ```bash
   git clone https://github.com/sussiniguanziroli/Mercadonet-Devs
   cd mercado.net
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Accede a la aplicación en [http://localhost:5173](http://localhost:5173).

## Estructura del proyecto

```
src/
├── components/
│   ├── AdminPanel.jsx      # Panel de administración
│   ├── ProveedoresList.jsx # Listado de proveedores y filtros
│   └── Login.jsx           # Componente de login
├── pages/
│   ├── HomePage.jsx        # Página principal
│   ├── Proveedores.jsx     # Página de proveedores
├── App.jsx                 # Punto de entrada de la aplicación
├── main.jsx                # Archivo principal para Vite
└── styles/                 # Archivos CSS
```

## Cómo contribuir

¡Las contribuciones son bienvenidas! Sigue estos pasos para colaborar:

1. Haz un fork del proyecto.
2. Crea una nueva rama para tu funcionalidad o corrección de errores:
   ```bash
   git checkout -b mi-nueva-funcionalidad
   ```
3. Realiza tus cambios y haz commit:
   ```bash
   git commit -m "Agrega nueva funcionalidad X"
   ```
4. Envía tus cambios al repositorio remoto:
   ```bash
   git push origin mi-nueva-funcionalidad
   ```
5. Abre un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.
