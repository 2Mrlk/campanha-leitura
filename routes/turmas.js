const express = require('express');
const router = express.Router();
const supabase = require('../data/supabase');

// GET /api/turmas
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .order('nome');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;