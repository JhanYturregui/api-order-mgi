## DESCARGAR Y LEVANTAR EL PROYECTO

1. Descargar el proyecto:

```
git clone git@github.com:JhanYturregui/api-order-mgi.git
```

2. Instalar dependencias

```
npm install --legacy-peer-deps
```

3. Crear un archivo .env basado en .env.template

4. Abrir docker desktop y en la raíz del proyecto levantar la bd

```
docker compose up -d
```

5. Levantar el proyecto

```
npm run start:dev
```

## PRUEBAS (POSTMAN)

1. Crear una petición en postman para crear un usuario con los siguientes datos

```
URL: http://localhost:3000/api/users
TYPE: POST
BODY:
{
    "name": "Test User",
    "email": "test@gmail.com",
    "password": "admin123"
}
```

2. Crear una petición en postman para crear un producto con los siguientes datos

```
URL: http://localhost:3000/api/products
TYPE: POST
BODY:
{
    "code": "pro001",
    "name": "Audios",
    "stock": 5
}
```

3. Crear una petición en postman para procesar la orden con los siguientes datos

```
URL: http://localhost:3000/api/orders
TYPE: POST
BODY:
{
    "userId": 1,
    "products": [{"productId": 1, "quantity": 1}]
}
```

## PRUEBAS DE CONCURRENCIA (JMETER)

Instalar y abrir jmeter y abrir el archivo Mgi-test-1.jmx

## DOCUMENTACIÓN SWAGGER

Para ver todos los endpoints se puede ingresar a la siguiente ruta

```
http://localhost:3000/api/docs
```

## PRUEBAS UNITARIAS

1. Correr pruebas unitarias y ver la cobertura del código

```
npm run test --coverage
```

2. Para ver la cobertura de forma gráfica al ejecutar el comando anterior se crea una carpeta "coverage", dentro hay otra llamada "lcov-report" y se abre el archivo "index.html"
