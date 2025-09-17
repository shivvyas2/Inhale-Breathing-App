const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for webhook
);

// Middleware to verify Clerk webhook signature
const verifyClerkWebhook = (req, res, next) => {
  const signature = req.headers['svix-signature'];
  const timestamp = req.headers['svix-timestamp'];
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!signature || !timestamp || !webhookSecret) {
    return res.status(400).json({ error: 'Missing required headers' });
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(timestamp + payload)
    .digest('base64');

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  next();
};

app.use(express.json());

// Webhook endpoint for user creation
app.post('/webhook/clerk', verifyClerkWebhook, async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'user.created') {
      const { id, email_addresses, username, first_name, last_name } = data;

      console.log('Creating Supabase profile for Clerk user:', id);

      // Extract username from email if not provided
      const emailUsername = email_addresses?.[0]?.email_address?.split('@')[0] || 'user';
      const finalUsername = username || emailUsername;

      // Create user profile in Supabase
      const { data: userProfile, error } = await supabase
        .from('users')
        .insert({
          id: id, // Use Clerk user ID
          username: finalUsername,
          email: email_addresses?.[0]?.email_address,
          level: 0,
          points: 0,
          streak: 0,
          total_minutes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating Supabase profile:', error);
        return res.status(500).json({ error: 'Failed to create user profile' });
      }

      console.log('Successfully created Supabase profile:', userProfile);
      return res.json({ success: true, user: userProfile });
    }

    if (type === 'user.updated') {
      const { id, email_addresses, username, first_name, last_name } = data;

      console.log('Updating Supabase profile for Clerk user:', id);

      // Update user profile in Supabase
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (username) updateData.username = username;
      if (email_addresses?.[0]?.email_address) updateData.email = email_addresses[0].email_address;

      const { data: userProfile, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating Supabase profile:', error);
        return res.status(500).json({ error: 'Failed to update user profile' });
      }

      console.log('Successfully updated Supabase profile:', userProfile);
      return res.json({ success: true, user: userProfile });
    }

    if (type === 'user.deleted') {
      const { id } = data;

      console.log('Deleting Supabase profile for Clerk user:', id);

      // Delete user profile from Supabase
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting Supabase profile:', error);
        return res.status(500).json({ error: 'Failed to delete user profile' });
      }

      console.log('Successfully deleted Supabase profile for user:', id);
      return res.json({ success: true });
    }

    // Handle other event types
    console.log('Unhandled webhook event type:', type);
    return res.json({ success: true, message: 'Event received but not processed' });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Clerk webhook server running on port ${port}`);
  console.log(`Webhook endpoint: http://localhost:${port}/webhook/clerk`);
});

