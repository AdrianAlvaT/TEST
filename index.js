const express = require("express");
const app = express();
const auth = require('./middlewares/auth');
const productRoutes = require('./dev/v1/products');
const userRoutes = require('./dev/v1/user');
const loginUsuario = require("./dev/v1/login");

app.use(express.json());
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.post('/api/v1/login', loginUsuario);

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
  });

  app.get('/api/admin/usuarios', auth(['admin']), (req, res) => {
    res.json({ message: 'Bienvenido, admin', user: req.user });
});

app.get('/api/general', auth(['admin', 'cliente']), (req, res) => {
    res.json({ message: `Hola, ${req.user.rol}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)});

