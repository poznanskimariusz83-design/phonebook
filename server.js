const http = require('node:http');

const PORT = Number(process.env.PORT) || 3000;
const SEARCH_FIELDS = [
  'lastName',
  'firstName',
  'team',
  'landlineNumber',
  'mobileNumber',
  'internalExtension',
];

// Replace this array with the application's authoritative hardcoded directory.
const USERS = [
  {
    lastName: 'Kowalski',
    firstName: 'Jan',
    team: 'Sales',
    landlineNumber: '+48 22 100 10 10',
    mobileNumber: '+48 600 100 100',
    internalExtension: '101',
  },
  {
    lastName: 'Nowak',
    firstName: 'Anna',
    team: 'Marketing',
    landlineNumber: '+48 22 100 10 11',
    mobileNumber: '+48 600 100 101',
    internalExtension: '102',
  },
  {
    lastName: 'Wisniewski',
    firstName: 'Piotr',
    team: 'Engineering',
    landlineNumber: '+48 22 100 10 12',
    mobileNumber: '+48 600 100 102',
    internalExtension: '201',
  },
  {
    lastName: 'Wojcik',
    firstName: 'Maria',
    team: 'Engineering',
    landlineNumber: '+48 22 100 10 13',
    mobileNumber: '+48 600 100 103',
    internalExtension: '202',
  },
  {
    lastName: 'Kaminski',
    firstName: 'Tomasz',
    team: 'Support',
    landlineNumber: '+48 22 100 10 14',
    mobileNumber: '+48 600 100 104',
    internalExtension: '301',
  },
];

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(JSON.stringify(body));
}

function normalise(value) {
  return String(value).trim().toLocaleLowerCase();
}

function searchUsers(criteria) {
  return USERS.filter((user) => SEARCH_FIELDS.every((field) => {
    if (!(field in criteria) || criteria[field] === null || criteria[field] === undefined) {
      return true;
    }

    return normalise(user[field]).includes(normalise(criteria[field]));
  }));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function handleRequest(request, response) {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    response.end();
    return;
  }

  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (request.method !== 'POST' || request.url !== '/users/search') {
    sendJson(response, 404, { error: 'Route not found' });
    return;
  }

  const rawBody = await readBody(request);
  let criteria;
  try {
    criteria = rawBody.trim() ? JSON.parse(rawBody) : {};
  } catch {
    sendJson(response, 400, { error: 'Request body must be valid JSON' });
    return;
  }

  if (!criteria || Array.isArray(criteria) || typeof criteria !== 'object') {
    sendJson(response, 400, { error: 'Request body must be a JSON object' });
    return;
  }

  const unknownFields = Object.keys(criteria).filter((field) => !SEARCH_FIELDS.includes(field));
  if (unknownFields.length > 0) {
    sendJson(response, 400, {
      error: 'Unknown search field(s)',
      fields: unknownFields,
      allowedFields: SEARCH_FIELDS,
    });
    return;
  }

  sendJson(response, 200, searchUsers(criteria));
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    if (!response.headersSent) {
      sendJson(response, 500, { error: 'Internal server error' });
    }
    console.error(error);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Phonebook API listening on http://localhost:${PORT}`);
  });
}

module.exports = { USERS, searchUsers, server };
