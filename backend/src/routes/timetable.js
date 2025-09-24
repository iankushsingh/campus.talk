const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/timetable/:userId/today
router.get('/:userId/today', async (req, res) => {
    try {
        const { userId } = req.params;
        // Find today's day name
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = days[new Date().getDay()];
        const [rows] = await pool.query('SELECT * FROM timetable WHERE user_id = ? AND day = ?', [userId, today]);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
