const pool = require('./db');

module.exports = async (req, res) => {
    /*
      Rasa webhook payload example:
      {
        "next_action": "action_get_timetable",
        "tracker": { ... },
        "domain": {...}
      }
      For simplicity, we'll parse the intent from req.body
    */
    try {
        const body = req.body;
        // When using Rasa custom action, the payload shape will be different.
        // This handler expects a simple structure: { intent: "get_timetable", user_id: 1, date: "2025-09-10" }
        const intent = body.intent || (body.next_action || '');
        if (intent.includes('timetable')) {
            const userId = body.user_id || 1;
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = days[new Date().getDay()];
            const [rows] = await pool.query('SELECT * FROM timetable WHERE user_id = ? AND day = ?', [userId, today]);
            const text = rows.length ? rows.map(r => `${r.start_time} - ${r.end_time}: ${r.subject} @ ${r.location}`).join('. ') : 'No classes today.';
            return res.json({ text });
        } else if (intent.includes('attendance')) {
            const userId = body.user_id || 1;
            const [rows] = await pool.query('SELECT date, status FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 7', [userId]);
            const text = rows.length ? rows.map(r => `${r.date}: ${r.status}`).join('; ') : 'No attendance records found.';
            return res.json({ text });
        } else if (intent.includes('notices')) {
            const [rows] = await pool.query('SELECT title FROM notices ORDER BY posted_at DESC LIMIT 3');
            const text = rows.length ? rows.map(r => r.title).join('; ') : 'No recent notices.';
            return res.json({ text });
        }
        return res.json({ text: "I didn't understand that. Can you rephrase?" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ text: 'Server error' });
    }
};
