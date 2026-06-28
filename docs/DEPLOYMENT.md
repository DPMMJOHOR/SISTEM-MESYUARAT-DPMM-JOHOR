# Deployment Guide for Each Environment

## Overview
This document provides deployment guides for development, staging, and production environments.

## Table of Contents
1. Environment Overview
2. Development Environment
3. Staging Environment
4. Production Environment
5. Deployment Process
6. Rollback Procedures
7. Monitoring
8. Troubleshooting

## 1. Environment Overview

### Development
- **Purpose**: Local development and testing
- **URL**: http://localhost:3000
- **Database**: Local Supabase project
- **Features**: Debug mode, hot reload, test data

### Staging
- **Purpose**: Pre-production testing
- **URL**: https://staging.dpmmjohor.github.io
- **Database**: Staging Supabase project
- **Features**: Production-like, test data, monitoring

### Production
- **Purpose**: Live production system
- **URL**: https://dpmmjohor.github.io
- **Database**: Production Supabase project
- **Features**: Full security, monitoring, backups

## 2. Development Environment

### Setup
1. Clone repositories
2. Install dependencies
3. Configure `.env.local`
4. Run dev server

### Configuration
```env
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
VITE_ENVIRONMENT=development
VITE_DEBUG=true
```

### Database
- Use development Supabase project
- Seed with test data
- Enable debug logging
- No RLS restrictions (optional)

### Testing
- Run unit tests: `npm test`
- Run integration tests: `npm run test:integration`
- Run E2E tests: `npm run test:e2e`

## 3. Staging Environment

### Setup
1. Create staging branch
2. Configure staging environment
3. Deploy to staging
4. Run smoke tests

### Configuration
```env
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
VITE_ENVIRONMENT=staging
VITE_DEBUG=false
```

### Database
- Use staging Supabase project
- Copy production schema
- Use test data
- Enable all RLS policies

### Deployment
```bash
# Create staging branch
git checkout -b staging

# Configure environment
cp .env.staging .env.local

# Deploy
git push origin staging
```

### Testing
- Run full test suite
- Manual testing
- Security scan
- Performance test

## 4. Production Environment

### Setup
1. Review staging results
2. Create release branch
3. Configure production environment
4. Deploy to production
5. Monitor deployment

### Configuration
```env
VITE_SUPABASE_URL=https://production-project.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
VITE_ENVIRONMENT=production
VITE_DEBUG=false
```

### Database
- Use production Supabase project
- Enable all security features
- Enable all RLS policies
- Enable backups

### Deployment
```bash
# Create release branch
git checkout -b release/v1.0.0

# Configure environment
cp .env.production .env.local

# Deploy
git push origin release/v1.0.0

# Merge to main
git checkout main
git merge release/v1.0.0
git push origin main
```

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] Security scan passes
- [ ] Code review complete
- [ ] Documentation updated
- [ ] Backups verified
- [ ] Monitoring configured
- [ ] Rollback plan ready

## 5. Deployment Process

### Automated Deployment
GitHub Actions automatically deploys on push to main:
1. Run tests
2. Build project
3. Deploy to GitHub Pages
4. Run smoke tests
5. Notify team

### Manual Deployment
For manual deployments:
1. Create release branch
2. Update version
3. Run tests locally
4. Push to GitHub
5. Monitor deployment

### Deployment Steps
1. **Prepare**
   - Create release branch
   - Update version number
   - Update changelog

2. **Test**
   - Run all tests
   - Manual testing
   - Security scan

3. **Deploy**
   - Push to GitHub
   - Monitor CI/CD
   - Verify deployment

4. **Verify**
   - Smoke tests
   - Monitor logs
   - Check functionality

5. **Monitor**
   - Watch for errors
   - Monitor performance
   - Check security alerts

## 6. Rollback Procedures

### Automatic Rollback
If deployment fails:
1. GitHub Actions auto-rolls back
2. Previous version restored
3. Team notified

### Manual Rollback
For manual rollback:
```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main
```

### Rollback Checklist
- [ ] Identify issue
- [ ] Determine rollback point
- [ ] Execute rollback
- [ ] Verify system
- [ ] Investigate issue
- [ ] Document incident

## 7. Monitoring

### Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring
- User analytics

### Security Monitoring
- Failed login attempts
- Rate limit violations
- Anomaly detection
- Security alerts

### Database Monitoring
- Query performance
- Connection pool
- Storage usage
- Backup status

### Log Monitoring
- Application logs
- Error logs
- Access logs
- Audit logs

## 8. Troubleshooting

### Common Deployment Issues

#### Build Failed
- Check Node.js version
- Verify dependencies
- Check for syntax errors
- Review build logs

#### Deployment Failed
- Check GitHub Actions status
- Verify environment variables
- Check GitHub Pages settings
- Review deployment logs

#### Runtime Errors
- Check browser console
- Review application logs
- Verify API endpoints
- Check network connectivity

### Getting Help
- Check deployment logs
- Review documentation
- Contact support team
- Create GitHub issue

## Environment Comparison

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| Debug Mode | Yes | No | No |
| Test Data | Yes | Yes | No |
| RLS Policies | Optional | Yes | Yes |
| Monitoring | Basic | Full | Full |
| Backups | Manual | Daily | Hourly |
| Security | Basic | Full | Full |

## Best Practices

### Development
- Use feature branches
- Test before committing
- Keep dependencies updated
- Use .env.local for secrets

### Staging
- Mirror production
- Use real data (sanitized)
- Test thoroughly
- Document issues

### Production
- Plan deployments
- Deploy during low traffic
- Monitor closely
- Have rollback ready

## Next Steps
After deployment:
1. Monitor system
2. Collect feedback
3. Plan improvements
4. Schedule next deployment
