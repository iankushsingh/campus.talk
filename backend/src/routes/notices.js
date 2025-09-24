const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/notices/latest
router.get('/latest', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM notices ORDER BY posted_at DESC LIMIT 10');
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
