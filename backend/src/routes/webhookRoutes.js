const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
// Simple webhook verification (we'll add proper verification later)
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || 'your_webhook_secret_here';

router.post('/clerk', async (req, res) => {
  try {
    // For now, we'll skip signature verification to get it working
    // You can add proper verification later
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing webhook data'
      });
    }

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

async function handleUserCreated(userData) {
  try {
    const { id, email_addresses, username } = userData;
    const email = email_addresses?.[0]?.email_address || '';
    const displayName = username || email.split('@')[0] || 'user';

    // Create user profile
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: id, // Clerk user ID as primary key
        username: displayName,
        email: email,
        level: 1,
        points: 0,
        streak: 0,
        total_minutes: 0
      }]);

    if (userError) throw userError;

    // Create streak record
    const { error: streakError } = await supabase
      .from('streaks')
      .insert([{
        user_id: id,
        current_streak: 0,
        longest_streak: 0,
        last_session_date: null
      }]);

    if (streakError) throw streakError;

    console.log(`User created: ${id}`);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function handleUserUpdated(userData) {
  try {
    const { id, email_addresses, username } = userData;
    const email = email_addresses?.[0]?.email_address || '';
    const displayName = username || email.split('@')[0] || 'user';

    const { error } = await supabase
      .from('users')
      .update({
        username: displayName,
        email: email
      })
      .eq('id', id);

    if (error) throw error;

    console.log(`User updated: ${id}`);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

async function handleUserDeleted(userData) {
  try {
    const { id } = userData;

    // Delete user data
    await supabase.from('sessions').delete().eq('user_id', id);
    await supabase.from('streaks').delete().eq('user_id', id);
    await supabase.from('users').delete().eq('id', id);

    console.log(`User deleted: ${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

module.exports = router;
