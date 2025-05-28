import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendCompletionEmail(
  email: string,
  childName: string,
  pdfUrl: string,
  heroImageUrl: string
) {
  await resend.emails.send({
    from: 'Storybook <noreply@yourdomain.com>',
    to: email,
    subject: `${childName}'s Personalized Storybook is Ready! 📚✨`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316; text-align: center;">Your Storybook is Ready!</h1>
        
        <div style="text-align: center; margin: 20px 0;">
          <img src="${heroImageUrl}" alt="${childName} as the hero" style="max-width: 300px; border-radius: 10px;" />
        </div>
        
        <p>Dear Parent,</p>
        
        <p>We're excited to share that <strong>${childName}'s personalized storybook</strong> has been created and is ready for download!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${pdfUrl}" style="background-color: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Your Storybook PDF</a>
        </div>
        
        <h3>Printing Instructions:</h3>
        <ul>
          <li>Print on high-quality paper (recommended: 200gsm or higher)</li>
          <li>Use color printing for the best experience</li>
          <li>Print at 100% scale (do not fit to page)</li>
          <li>Consider professional printing for a premium finish</li>
        </ul>
        
        <p>Your storybook is 8.25" × 8.25" with professional bleed margins, perfect for binding into a beautiful keepsake.</p>
        
        <p>Thank you for choosing Storybook to create magical memories with ${childName}!</p>
        
        <p>Happy reading! 📖</p>
        
        <hr style="margin: 30px 0;" />
        <p style="font-size: 12px; color: #666;">This link will be available for 30 days. Please download and save your storybook.</p>
      </div>
    `,
  })
} 