const pool = require("../../../config/db");

const newProduct = async (req, res) => {
    try {
        const { name, price, description } = req.body;
        const result = await pool.query("INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *", [name, price, description]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = newProduct;