import { corsHeaders } from '../_shared/cors.ts';

interface ContributionRequest {
  projectId: string;
  projectTitle: string;
  projectCreatorEmail: string;
  projectCreatorName: string;
  requesterName: string;
  requesterEmail: string;
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
      projectCreatorEmail,
      projectCreatorName,
      requesterName,
      requesterEmail,
      projectUrl,
      message
    }: ContributionRequest = await req.json();

    // Validate required fields
    if (!projectId || !projectTitle || !projectCreatorEmail || !projectCreatorName || !requesterName || !requesterEmail || !projectUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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
        <a href="mailto:${requesterEmail}?subject=Re: Contribution Request for ${projectTitle}" class="button">
          📧 Reply to ${requesterName}
        </a>
      </div>
      
      <p>You can reach out to ${requesterName} directly at <a href="mailto:${requesterEmail}" style="color: #667eea;">${requesterEmail}</a> to discuss potential collaboration opportunities.</p>
      
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

You can reach out to ${requesterName} directly at ${requesterEmail} to discuss potential collaboration opportunities.

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
          email: 'noreply@codeideas.com', 
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
          requester_email: requesterEmail
        }
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('SendGrid API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email notification',
          details: 'Email service temporarily unavailable'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Email sent successfully to:', projectCreatorEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contribution request sent successfully' 
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