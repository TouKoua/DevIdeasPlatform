import { corsHeaders } from '../_shared/cors.ts';

interface ContributionRequest {
  projectId: string;
  projectTitle: string;
  projectCreatorEmail: string;
  projectCreatorName: string;
  requesterName: string;
  requesterEmail: string;
  projectUrl: string;
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
      projectUrl
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

    // Create email content
    const emailSubject = `Contribution Request for "${projectTitle}"`;
    const emailBody = `
Hello ${projectCreatorName},

${requesterName} is interested in contributing to your project "${projectTitle}" on CodeIdeas.

Project Details:
- Title: ${projectTitle}
- Project URL: ${projectUrl}

Contributor Information:
- Name: ${requesterName}
- Email: ${requesterEmail}

You can reach out to ${requesterName} directly at ${requesterEmail} to discuss potential collaboration opportunities.

Best regards,
The CodeIdeas Team

---
This email was sent automatically from CodeIdeas. If you have any questions, please contact our support team.
    `.trim();

    // In a real implementation, you would use a service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    // - Postmark
    
    // For this demo, we'll simulate sending the email
    console.log('Sending email to:', projectCreatorEmail);
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, you would integrate with your email service here:
    /*
    const emailResponse = await fetch('https://api.sendgrid.v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: projectCreatorEmail, name: projectCreatorName }],
          subject: emailSubject
        }],
        from: { email: 'noreply@codeideas.com', name: 'CodeIdeas' },
        content: [{
          type: 'text/plain',
          value: emailBody
        }]
      })
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }
    */

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