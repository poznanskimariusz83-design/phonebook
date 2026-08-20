# Phonebook API

Small dependency-free Node.js API backed by a hardcoded user directory.

## Run

```sh
npm start
```

The service listens on `http://localhost:3000` by default. Set `PORT` to use a different port.

## Search users

Send one or more fields in a JSON object to `POST /users/search`. All supplied fields are combined with AND logic. Values are matched case-insensitively and may be partial.

```sh
curl -X POST http://localhost:3000/users/search \
	-H 'Content-Type: application/json' \
	-d '{"team":"engineering","firstName":"pi"}'
```

Supported fields are `lastName`, `firstName`, `team`, `landlineNumber`, `mobileNumber`, and `internalExtension`. An empty object returns all users.

The response is a JSON array of matching records. Invalid JSON, unsupported fields, and non-object payloads return `400`. `GET /health` returns `{ "status": "ok" }`.

## Test

```sh
npm test
```