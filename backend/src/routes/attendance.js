const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/attendance/:userId
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.query('SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30', [userId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
