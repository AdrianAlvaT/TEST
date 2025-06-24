const express = require("express");
const app = express();
const auth = require('./middlewares/auth');

const listProducts = require('./dev/v1/products/listProducts');
const createProduct = require('./dev/v1/products/createProduct');

const createUsuario = require('./dev/v1/user/create');
const listUsuarios = require('./dev/v1/user/list');
const getUsuarioById = require('./dev/v1/user/get');
const update = require('./dev/v1/user/update');
const deleteUsuario = require('./dev/v1/user/delete');
const loginUsuario = require("./dev/v1/user/login");

app.use(express.json());

app.get('/api/v1/products', listProducts);
app.post('/api/v1/products', createProduct);

app.get('/api/v1/user', listUsuarios);
app.get('/api/v1/user/:id', getUsuarioById);
app.post('/api/v1/user', createUsuario);
app.put('/api/v1/user/:id', update.updateUsuario);
app.put('/api/v1/user/:id/password', update.updatePassword);
app.delete('/api/v1/user/:id', deleteUsuario);

app.post('/api/register', createUsuario);

app.post('/api/v1/login', loginUsuario);

app.get('/api/admin/usuarios', auth(['admin']), (req, res) => {
    res.json({ message: 'Bienvenido, admin', user: req.user });
});

app.get('/api/general', auth(['admin', 'cliente']), (req, res) => {
    res.json({ message: `Hola, ${req.user.rol}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)});

