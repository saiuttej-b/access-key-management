# Description

This project consists of two microservices, one for access key management and the other is for users to get token information.

## Access Key Management Service

This service is responsible for managing access keys. It has the following endpoints:

### Authentication (auth.controller.ts)

- POST /api/auth/sign-in: This endpoint is responsible for authenticating the user and returning a token.
- POST /api/auth/dev-admin: This endpoint is responsible for creating a user with the role of admin. It is only available in the development environment. The user created by this endpoint will have the following credentials:
  - email: admindev@gmail.com
  - password: admin-dev

### Users (users.controller.ts)

- POST /api/users: This endpoint is responsible for creating a user.

### Access Keys (access-keys.controller.ts)

- POST /api/access-keys: This endpoint is responsible for creating an access key.
- PUT /api/access-keys/:key: This endpoint is responsible for updating an access key.
- DELETE /api/access-keys/:key: This endpoint is responsible for deleting an access key.
- GET /api/access-keys: This endpoint is responsible for listing all access keys.
- GET /api/access-keys/:key: This endpoint is responsible for getting an access key.

above endpoints are protected by JWT token, so you need to authenticate first to get the token. These apis can only be accessed by the admin user.

### User Access Keys (user-access-keys.controller.ts)

- GET /api/user-access-keys/:key: This endpoint is responsible for getting the access keys of a user.
- POST /api/user-access-keys/:key/disable: This endpoint is responsible for disabling an access key of a user.

above endpoints are for the end user to get their accesskey details and option to disable the access key.

## Token Information Service

This service is responsible for providing information about the token. It has the following endpoints:

### Token Info (app.controller.ts)

- GET /api/token-info: This endpoint is responsible for providing information about the token.

above endpoint is protected and can only be accessed with a valid access key.
AccessKeyMiddleware (access-key.middleware.ts) is used to validate the access key.

## Tools and Technologies

- NestJs
- MongoDB as primary database, used mongoose
- Redis for caching and microservice communication
- Jest for testing

## Env file configuration

```.env
TZ=
PORT=
PROJECT_ENVIRONMENT=

CORS_ORIGIN=

JWT_SECRET=
JWT_EXPIRATION_TIME=

MONGO_DB_HOST=
MONGO_DB_USERNAME=
MONGO_DB_PASSWORD=
MONGO_DB_DATABASE=
MONGO_DB_AUTO_INDEX=

REDIS_HOST=
REDIS_PORT=

```

Same file for both services. You can create a .env file in the root directory of both services.
