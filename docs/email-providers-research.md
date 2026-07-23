# Email Service Providers Research
## For DPMM Meeting System Transactional Emails

**Date:** 2026-06-29  
**Purpose:** Research email service providers to replace EmailJS (free tier templates maxed out) for meeting invites and reminders.

---

## Executive Summary

Based on research for transactional email delivery in 2026, here are the top recommendations for DPMM Meeting System:

### Top Recommendations

1. **Resend** - Best overall for modern applications
   - 3,000 emails/month free forever
   - $20/month for 50,000 emails
   - Modern developer experience
   - Good deliverability (97% Gmail, 93% Outlook)

2. **Postmark** - Best for deliverability-critical applications
   - 100 emails/month free (trial only)
   - $15/month for 10,000 emails
   - Industry-leading deliverability (99% Gmail, 95% Outlook)
   - Transactional-only (no marketing emails)

3. **AWS SES** - Best for cost at scale
   - 62,000 emails/month free from EC2
   - $0.10 per 1,000 emails
   - Requires more engineering overhead
   - Best for high volume

---

## Detailed Comparison

### 1. Resend
**Best For:** Modern applications, developer experience, React/Next.js projects

**Free Tier:** 3,000 emails/month forever

**Pricing:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Scale: $90/month for 100,000 emails
- Enterprise: Custom pricing

**Strengths:**
- Modern, clean API
- React Email integration
- Excellent developer documentation
- Fast onboarding
- Good deliverability rates
- Supports both transactional and limited marketing

**Weaknesses:**
- Newer provider (founded 2023)
- Less battle-tested than Postmark/SendGrid

**Deliverability:**
- Gmail: 97%
- Outlook: 93%
- India local ISPs: 91%

**Recommended For:** DPMM Meeting System if you want modern DX and reasonable pricing

---

### 2. Postmark
**Best For:** Transactional-only applications where deliverability is mission-critical

**Free Tier:** 100 emails/month (trial/evaluation only)

**Pricing:**
- Trial: 100 emails/month
- Basic: $15/month for 10,000 emails
- Pro: $50/month for 50,000 emails
- Scale: $100/month for 125,000 emails

**Strengths:**
- Industry-leading deliverability (98.7% inbox placement)
- Transactional-only policy (no marketing emails on same IPs)
- Fast delivery (1-2 seconds)
- Excellent bounce/complaint handling
- Mature templating system

**Weaknesses:**
- No free tier for production
- More expensive than competitors
- Transactional-only (no marketing features)

**Deliverability:**
- Gmail: 99%
- Outlook: 95%
- India local ISPs: 93%

**Recommended For:** DPMM Meeting System if deliverability is the top priority and budget allows

---

### 3. Amazon SES (Simple Email Service)
**Best For:** Cost-sensitive teams, AWS-native applications, high volume

**Free Tier:** 62,000 emails/month from EC2 (first 12 months)

**Pricing:**
- $0.10 per 1,000 emails
- No monthly subscription
- No minimum spend

**Strengths:**
- Unbeatable cost at scale
- Native AWS integration (Lambda, SNS, S3, CloudWatch)
- Full control over infrastructure
- High volume capability

**Weaknesses:**
- Requires engineering overhead to manage deliverability
- No built-in template management
- Steeper learning curve
- Must handle bounces/complaints manually

**Deliverability:**
- Gmail: 93%
- Outlook: 88%
- India local ISPs: 85% (improves with dedicated IP)

**Recommended For:** DPMM Meeting System if you're already on AWS and need to send very high volume

---

### 4. SendGrid (Twilio SendGrid)
**Best For:** High volume, enterprise features, mixed transactional + marketing

**Free Tier:** 100 emails/day (3,000/month) forever

**Pricing:**
- Free: 100 emails/day
- Essentials: $19.95/month for 50,000 emails
- Pro: $89.95/month for 100,000 emails
- Premier: Custom pricing

**Strengths:**
- Established brand (owned by Twilio)
- Handles very high volume
- Combined transactional + marketing platform
- Enterprise features (dedicated IPs, advanced suppression)
- Good integrations

**Weaknesses:**
- Dated developer experience
- Confusing pricing tiers
- Expensive at scale
- Lower deliverability than Postmark

**Deliverability:**
- Gmail: 96%
- Outlook: 92%
- India local ISPs: 90%

**Recommended For:** DPMM Meeting System if you need marketing + transactional in one platform

---

### 5. Mailgun
**Best For:** Complex routing, EU data residency, advanced analytics

**Free Tier:** 100 emails/day for 30 days (trial only)

**Pricing:**
- Trial: 100 emails/day (30 days)
- Foundation: $35/month for 50,000 emails
- Scale: $90/month for 100,000 emails

**Strengths:**
- Modular infrastructure (5 specialized APIs)
- EU data residency available
- Strong analytics and log retention
- Complex routing capabilities

**Weaknesses:**
- No real free tier
- Higher minimum cost ($35/month)
- More complex than needed for simple use cases

**Deliverability:**
- Gmail: 95%
- Outlook: 91%
- India local ISPs: 88%

**Recommended For:** DPMM Meeting System if you need EU data residency or complex routing

---

### 6. MailerSend
**Best For:** Mid-tier applications, generous free tier

**Free Tier:** 3,000 emails/month forever

**Pricing:**
- Free: 3,000 emails/month
- Premium: $30/month for 50,000 emails
- Pro: $145/month for 200,000 emails

**Strengths:**
- Generous free tier (3,000/month)
- Templates included
- Good deliverability
- Simple to use

**Weaknesses:**
- Less known than major providers
- Fewer integrations

**Deliverability:** Not independently tested but comparable to paid tier

**Recommended For:** DPMM Meeting System as a solid mid-tier option

---

### 7. Brevo (formerly Sendinblue)
**Best For:** Small operations needing both transactional and marketing

**Free Tier:** 300 emails/day (9,000/month)

**Pricing:**
- Free: 300/day (9,000/month)
- Paid starts at $9/month

**Strengths:**
- Bundled transactional + marketing
- Low starting price
- Good for small teams

**Weaknesses:**
- Lower deliverability (79.8% tested)
- Marketing-focused reputation affects transactional delivery
- No inbound email on free tier

**Deliverability:** 79.8% average (lower than dedicated transactional providers)

**Recommended For:** DPMM Meeting System only if budget is very tight and you accept lower deliverability

---

## Cost Comparison at Different Volumes

### At 10,000 emails/month
- **AWS SES:** $1
- **Resend:** $20
- **SendGrid:** $19.95
- **Postmark:** $15
- **Mailgun:** $15
- **MailerSend:** $30

### At 50,000 emails/month
- **AWS SES:** $5
- **Resend:** $20
- **SendGrid:** $19.95-89.95
- **Postmark:** $50
- **Mailgun:** $35
- **MailerSend:** $30

### At 100,000 emails/month
- **AWS SES:** $10
- **Resend:** $90
- **SendGrid:** $89.95+
- **Postmark:** $100
- **Mailgun:** $90
- **MailerSend:** $145

---

## Recommendation for DPMM Meeting System

### Primary Recommendation: **Resend**

**Reasons:**
1. **Generous free tier** (3,000 emails/month) - sufficient for testing and initial rollout
2. **Modern developer experience** - easy integration with existing system
3. **Good deliverability** - 97% Gmail, 93% Outlook
4. **Reasonable pricing** - $20/month for 50,000 emails
5. **Supports both transactional and limited marketing** - flexible for future needs
6. **React Email integration** - if you modernize the frontend later

### Alternative: **Postmark**

**Choose Postmark if:**
- Deliverability is absolutely critical
- Budget allows for higher cost ($15/month minimum)
- You only need transactional emails (no marketing)
- You want the industry's best inbox placement rates

### Alternative: **AWS SES**

**Choose AWS SES if:**
- You're already using AWS infrastructure
- You expect very high volume (100,000+ emails/month)
- You have engineering capacity to manage deliverability
- Cost is the primary concern

---

## Migration Considerations

### From EmailJS
- EmailJS uses a different architecture (client-side)
- Recommended providers use server-side APIs
- Will need to implement backend endpoint for email sending
- Can integrate with existing Supabase backend

### Implementation Steps
1. Sign up for chosen provider
2. Configure API keys and domain verification
3. Create email templates for meeting invites and reminders
4. Implement backend endpoint to send emails
5. Update frontend to call backend instead of EmailJS
6. Test deliverability with small batch
7. Full rollout

---

## Next Steps

1. **Choose provider** based on budget and priorities
2. **Set up account** and verify domain
3. **Create templates** for meeting invites and reminders
4. **Implement integration** in backend
5. **Test** with small group before full rollout
6. **Monitor** deliverability and adjust as needed

---

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Postmark Documentation](https://postmarkapp.com/developer/user-guide)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Mailgun Documentation](https://documentation.mailgun.com/)
