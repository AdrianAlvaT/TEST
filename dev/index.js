const express = require("express");
const app = express();
const listProducts = require("./v1/products/listProducts");
const newProduct = require("./v1/products/newProduct");
const shoppingProduct = require("./v1/products/shoppingProduct");

app.use(express.json());
app.get('/api/v1/products', listProducts);
app.post('/api/v1/products', newProduct);
app.post('/api/v1/products/buy', shoppingProduct);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)});
