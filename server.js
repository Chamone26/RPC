const express = require('express');
const app = express();
const port = 3000;

// middleware

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST');
    next();
});

let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

let eventLog = [];

// helper function to create JSON-RPC response
function createResponse(id, result, error = null) {
    const response = {
        jsonrpc: '2.0',
        id: id,
    };
    
    if (error) {
        response.error = error;
    }
    else {
        response.result = result;
    }

    return response;
}

// helper function to create error objects
function createError(code, message) {
    return {code, message};   
}

// JSON-RPC method handlers
const methods = {
    getUser(params) {
        if (!params || !params.id) {
            throw createError(-32602, 'Invalid params: id is required');
        }

        const user = users.find(u => u.id === params.id);
        if (!user) {
            throw createError(-32602, 'User not found');
        }
        return user;
    },

    getUsers() {
        return users;
    },

    createUser(params) {
        if (!params || !params.name || !params.email) {
            throw createError(-32602, 'Invalid params: name and email are required');
        }
        const newUser = { id: users.length + 1, name: params.name, email: params.email };
        users.push(newUser);
        return newUser;
    },
    
    deleteUser(params) {
        if (!params || !params.id) {
            throw createError(-32602, 'Invalid params: id is required');
        }
        const index = users.findIndex(u => u.id === params.id);
        if (index === -1) {
            throw createError(-32602, 'User not found');
        }
        users.splice(index, 1);
        return { message: 'User deleted successfully' };
    }
}

function processRequest(request) {
    if (!request || !request.method || request.jsonrpc !== '2.0') {
        throw createError(-32600, 'Invalid Request');
    }

    const method = request.method;
    const params = request.params;
    const id = request.id;

    if (!methods[method]) {
        throw createError(-32601, 'Method not found');
    }

    const result = methods[method](params);
    return createResponse(id, result);

}

app.post('/json-rpc', (req, res) => {
    try {
        const response = processRequest(req.body);
        res.json(response);
    }
    catch (error) {
        console.error("Unhandled error:", error);
        res.json(createResponse(null, null, createError(-32603, 'Internal error')));
    }
});

app.listen(port, () => {
    console.log(`JSON-RPC server listening at http://localhost:${port}`);
    console.log(`Available methods: ${Object.keys(methods)}`);
});
