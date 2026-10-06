import nodemailer from 'nodemailer';

export interface ApprovedEmailPayload {
  to: string;
  subject: string;
  body: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
}

/**
 * Basic Gmail integration for Sponsy Bot.
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD in environment variables.
 * 
 * Safety Constraint: Only emails marked as 'approved' will be sent.
 */
export async function sendApprovedEmail(
  payload: ApprovedEmailPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  
  // Guard Clause: Only send explicitly approved emails
  if (payload.status !== 'approved') {
    throw new Error(
      `Email sending rejected: current status is '${payload.status}'. Only 'approved' emails can be sent.`
    );
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment.');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: user,
      to: payload.to,
      subject: payload.subject,
      text: payload.body, // Simple text body for now
    };

    const info = await transporter.sendMail(mailOptions);
    
    return { 
      success: true, 
      messageId: info.messageId 
    };
  } catch (error) {
    console.error('Failed to send email via Gmail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown Gmail API error' 
    };
  }
}
