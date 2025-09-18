const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { validateUser } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - clerk_id
 *         - username
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated user ID
 *         clerk_id:
 *           type: string
 *           description: Clerk user ID
 *         username:
 *           type: string
 *           description: Username
 *         email:
 *           type: string
 *           description: User email
 *         level:
 *           type: integer
 *           description: User level
 *         points:
 *           type: integer
 *           description: User points
 *         streak:
 *           type: integer
 *           description: Current streak
 *         total_minutes:
 *           type: integer
 *           description: Total meditation minutes
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/users/{clerkId}:
 *   get:
 *     summary: Get user by Clerk ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk user ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', clerkId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', validateUser, async (req, res) => {
  try {
    // Map clerk_id to id for database schema
    const userData = {
      id: req.body.clerk_id,
      username: req.body.username,
      first_name: req.body.first_name || null,
      last_name: req.body.last_name || null,
      email: req.body.email,
      level: req.body.level,
      points: req.body.points,
      streak: req.body.streak,
      total_minutes: req.body.total_minutes
    };

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/users/{clerkId}:
 *   put:
 *     summary: Update user by Clerk ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .update(req.body)
      .eq('id', clerkId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/users/{clerkId}:
 *   delete:
 *     summary: Delete user by Clerk ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', clerkId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
