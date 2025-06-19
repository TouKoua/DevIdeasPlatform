import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';

interface ContributionRequest {
  projectId: string;
  projectTitle: string;
  projectCreatorId: string;
  projectCreatorName: string;
  requesterId: string;
  requesterName: string;
  projectUrl: string;
  message?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      projectId,
      projectTitle,
      projectCreatorId,
      projectCreatorName,
      requesterId,
      requesterName,
      projectUrl,
      message
    }: ContributionRequest = await req.json();

    // Validate required fields
    if (!projectId || !projectTitle || !projectCreatorId || !projectCreatorName || !requesterId || !requesterName || !projectUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with service role key to access auth.users
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Database service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Check if a contribution request already exists for this project and requester
    const { data: existingRequest, error: checkError } = await supabase
      .from('contribution_requests')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('requester_id', requesterId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing contribution request:', checkError);
      return new Response(
        JSON.stringify({ error: 'Database error while checking existing requests' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (existingRequest) {
      return new Response(
        JSON.stringify({ 
          error: 'Contribution request already exists',
          details: `You have already submitted a ${existingRequest.status} contribution request for this project.`
        }),
        {
          status: 409, // Conflict
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch actual email addresses from auth.users
    const { data: projectCreatorAuth, error: creatorError } = await supabase.auth.admin.getUserById(projectCreatorId);
    const { data: requesterAuth, error: requesterError } = await supabase.auth.admin.getUserById(requesterId);

    if (creatorError || !projectCreatorAuth.user?.email) {
      console.error('Error fetching project creator email:', creatorError);
      return new Response(
        JSON.stringify({ error: 'Could not fetch project creator information' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (requesterError || !requesterAuth.user?.email) {
      console.error('Error fetching requester email:', requesterError);
      return new Response(
        JSON.stringify({ error: 'Could not fetch requester information' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const projectCreatorEmail = projectCreatorAuth.user.email;
    const requesterEmail = requesterAuth.user.email;

    // Get SendGrid API key from environment
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    
    if (!sendGridApiKey) {
      console.error('SENDGRID_API_KEY environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert contribution request into database FIRST (before sending email)
    // This ensures we catch any duplicate constraint violations early
    const { data: contributionRequest, error: insertError } = await supabase
      .from('contribution_requests')
      .insert({
        project_id: projectId,
        requester_id: requesterId,
        message: message || null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting contribution request:', insertError);
      
      // Check if this is a unique constraint violation (duplicate request)
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ 
            error: 'Contribution request already exists',
            details: 'You have already submitted a contribution request for this project.'
          }),
          {
            status: 409, // Conflict
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // For any other database error
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save contribution request',
          details: 'Database error occurred while saving your request. Please try again.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Contribution request saved to database:', contributionRequest.id);

    // Create email content
    const emailSubject = `New Contribution Request for "${projectTitle}"`;
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contribution Request</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 New Contribution Request</h1>
      <p>Someone wants to collaborate on your project!</p>
    </div>
    
    <div class="content">
      <p>Hello <strong>${projectCreatorName}</strong>,</p>
      
      <p>Great news! <strong>${requesterName}</strong> is interested in contributing to your project on CodeIdeas.</p>
      
      <div class="card">
        <h3>📋 Project Details</h3>
        <p><strong>Project:</strong> ${projectTitle}</p>
        <p><strong>Project URL:</strong> <a href="${projectUrl}" style="color: #667eea;">${projectUrl}</a></p>
      </div>
      
      <div class="card">
        <h3>👤 Contributor Information</h3>
        <p><strong>Name:</strong> ${requesterName}</p>
        <p><strong>Email:</strong> <a href="mailto:${requesterEmail}" style="color: #667eea;">${requesterEmail}</a></p>
        ${message ? `<p><strong>Message:</strong></p><blockquote style="border-left: 3px solid #667eea; padding-left: 15px; margin: 10px 0; font-style: italic;">${message}</blockquote>` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${projectUrl}/contributions" class="button">
          🎯 Manage Contribution Requests
        </a>
      </div>
      
      <p>You can manage this contribution request directly on CodeIdeas by visiting your project's contribution requests page. From there, you can accept or decline the request and send a response message.</p>
      
      <p>We're excited to see what you'll build together! 🎉</p>
    </div>
    
    <div class="footer">
      <p>Best regards,<br><strong>The CodeIdeas Team</strong></p>
      <p>This email was sent automatically from CodeIdeas. If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const emailText = `
Hello ${projectCreatorName},

${requesterName} is interested in contributing to your project "${projectTitle}" on CodeIdeas.

Project Details:
- Title: ${projectTitle}
- Project URL: ${projectUrl}

Contributor Information:
- Name: ${requesterName}
- Email: ${requesterEmail}
${message ? `- Message: ${message}` : ''}

You can manage this contribution request directly on CodeIdeas by visiting your project's contribution requests page at: ${projectUrl}/contributions

From there, you can accept or decline the request and send a response message.

Best regards,
The CodeIdeas Team

---
This email was sent automatically from CodeIdeas. If you have any questions, please contact our support team.
    `.trim();

    // Send email using SendGrid API
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: projectCreatorEmail, name: projectCreatorName }],
          subject: emailSubject
        }],
        from: { 
          email: 'noreply@codeideas.org', 
          name: 'CodeIdeas Platform' 
        },
        reply_to: {
          email: requesterEmail,
          name: requesterName
        },
        content: [
          {
            type: 'text/plain',
            value: emailText
          },
          {
            type: 'text/html',
            value: emailHtml
          }
        ],
        categories: ['contribution-request'],
        custom_args: {
          project_id: projectId,
          requester_id: requesterId
        }
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('SendGrid API error:', errorText);
      
      // Email failed but database record was created successfully
      // This is a partial success - the request is saved but notification failed
      console.log('Contribution request saved but email notification failed');
      
      return new Response(
        JSON.stringify({ 
          success: true,
          warning: 'Contribution request saved successfully, but email notification could not be sent. The project creator will still see your request in their dashboard.',
          message: 'Contribution request submitted successfully',
          requestId: contributionRequest.id
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Email sent successfully to:', projectCreatorEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contribution request sent successfully',
        requestId: contributionRequest.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending contribution request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send contribution request',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});