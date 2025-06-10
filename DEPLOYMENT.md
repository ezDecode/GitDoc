# GitDocify Production Deployment Guide

## Production Environment Setup

### Environment Variables

Create a `.env.production` file with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secure-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# AI Service
GEMINI_API_KEY=your-gemini-api-key

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Optional: Monitoring and Analytics
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id
```

### Database Setup (PostgreSQL)

1. Create a PostgreSQL database
2. Update the DATABASE_URL in your environment variables
3. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

### Build and Deploy

#### Option 1: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Option 2: Docker Deployment

```bash
# Build production image
docker build -t gitdocify .

# Run container
docker run -p 3000:3000 --env-file .env.production gitdocify
```

#### Option 3: Traditional Server

```bash
# Build for production
npm run build:production

# Start production server
npm start
```

### Performance Optimizations

1. **CDN Setup**: Use a CDN for static assets
2. **Database Optimization**: Index frequently queried fields
3. **Caching**: Implement Redis for session storage and API caching
4. **Monitoring**: Set up error tracking and performance monitoring

### Security Checklist

- [ ] All environment variables are secure and rotated regularly
- [ ] HTTPS is enabled with valid SSL certificates
- [ ] Rate limiting is implemented
- [ ] Security headers are configured (handled by middleware)
- [ ] Database connections are secured
- [ ] API keys have minimal required permissions

### Monitoring and Logging

The application includes built-in logging for:

- API requests and responses
- User actions
- GitHub API usage
- Gemini AI requests
- Error tracking

Consider integrating with:

- Sentry for error tracking
- DataDog/New Relic for performance monitoring
- LogRocket for user session replay

### Scaling Considerations

1. **Horizontal Scaling**: The app is stateless and can be scaled horizontally
2. **Database Scaling**: Consider read replicas for heavy read workloads
3. **API Rate Limits**: Monitor GitHub and Gemini API usage
4. **Caching**: Implement Redis for session and API response caching

### Backup Strategy

1. **Database Backups**: Automated daily backups
2. **Environment Configuration**: Secure backup of environment variables
3. **User Data**: Regular exports of user-generated documentation

### Health Checks

The application includes basic health check endpoints:

- `/api/health` - Application health
- `/api/auth/session` - Authentication system health

### Support and Maintenance

1. Monitor error rates and performance metrics
2. Keep dependencies updated
3. Rotate API keys regularly
4. Monitor API usage limits
5. Regular security audits
