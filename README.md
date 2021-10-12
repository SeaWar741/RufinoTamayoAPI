# **Rufino Tamayo API**

## **Descripción general:**

La API ha sido desarrollada como intermediario entre la aplicación de Android y la base de datos. En ella se hace toda la parte de la lógica de negocio, operaciones a los datos, lectura de información, gestión de usuarios, entre otros. A esta API se llega a traves de llamadas http en el lenguaje de su preferencia. Incluyendo headers para los tokens de autenticación

## **Seguridad:**
La API cuenta con medidas preventivas contra:

- Ataques DOS
- Ataques XSS
- Ataques de fuerza bruta
- Ataques de inyección SQL/NoSQL 

## **Requsisitos:**
- Node 14.4.0
- Conexión a internet
- Puerto 10017 abierto
- 8GB de RAM

## **Start Up**
Para correr el servidor es necesario clonar el repositorio con el siguiente comando:

    git clone https://github.com/SeaWar741/RufinoTamayoAPI

Posteriormente se dirige a la carpeta y dentro de ella se ejecuta el siguiente comando:

    npm install

Esto se encargará de descargar todas las dependencias del proyecto (Tomará algunos minutos). Una vez completada la descarga el servidor estará listo para ser iniciado con el siguiente comando:

    npm start

En caso de buscar dejarlo en segundo plano o que el output no sea visible en la consola usar el siguiente comando (Linux):

    npm start &

Sin embargo, el servidor requiere de un archivo ***.env*** el cual contiene la información sensible como el URI de Mongo, la direccion de correo electronico, el token key, entre otros. Este archivo será unicamente proporcionado a aquellos con autorización o en caso de hacer una implementación propia se deberá copiar el siguiente formato:

    API_PORT= <Puerto a utilizar (10017)>
    TOKEN_KEY= <Key para la generación de tokens>
    MONGO_URI= <URI de Mongo>
    SG_APIKEY= <key de Sendgrid>
    SG_EMAIL= <email de salida>


## **Documentación de rutas**
A continuación se muestra un link con la documentación comentada sobre las diferentes rutas de la API, esta se actualza a medida que se vea modificado el codigo. Las rutas estan puestas con localhost y el puerto 3000. Sin embargo, para el deployment y pruebas generales usar la IP publica del servidor donde ha sido alojado y el puerto (10017).

**Link:** https://documenter.getpostman.com/view/15737721/UV5RkKwz

