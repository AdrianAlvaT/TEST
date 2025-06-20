const pool = require("../../../config/db");

const shoppingProduct = async (req, res) => {
    const {userId, productId, quantity} = req.body;
    try {
        const result = await pool.query("INSERT INTO shopping (userId, productId, quantity) VALUES ($1, $2, $3) RETURNING *", [userId, productId, quantity]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = shoppingProduct;