# GitDocify - AI-Powered Documentation Generator

A Next.js application that generates comprehensive documentation for GitHub repositories using Google's Gemini AI, similar to GitDocify.com.

## Features

- 🔐 **Multi-Provider Authentication** - Sign in with Google or GitHub
- 🤖 **AI-Powered Documentation** - Generate comprehensive docs using Google Gemini AI
- 📂 **GitHub Integration** - Browse and select repositories from your GitHub account
- 📝 **Customizable Documentation** - Choose sections, depth, and output format
- 💾 **Document Management** - Save and manage generated documentation
- 🎨 **Modern UI** - Beautiful, responsive interface with dark mode support

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js with Google & GitHub OAuth
- **Database**: SQLite with Prisma ORM
- **AI**: Google Gemini AI API
- **Styling**: Tailwind CSS
- **GitHub Integration**: Octokit
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 18+ and npm/yarn
- Google OAuth application (for authentication)
- GitHub OAuth application (for repository access)
- Google AI Studio API key (for Gemini AI)

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/ezDecode/GitDocument.git
cd GitDocument
npm install
```

### 2. Environment Configuration

Copy the `.env.example` file to `.env.local` and update the credentials:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secure_secret_here

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (for repository access)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Database
DATABASE_URL="file:../prisma/dev.db"
```

### 3. OAuth Setup

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

#### Google AI Studio Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to `.env.local`

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create and migrate database
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Application Flow

### 1. Authentication

- Users can sign in with Google or GitHub
- Session management handled by NextAuth.js
- Automatic redirect to dashboard after successful authentication

### 2. Dashboard

- **GitHub Integration**: Connect and browse repositories
- **Repository Search**: Search and filter repositories by name, language, visibility
- **Repository Selection**: Choose a repository for documentation generation

### 3. Documentation Generation

- **Customization Options**:
  - Include sections: README, Installation, API docs, Examples, Contributing
  - Documentation depth: Basic, Detailed, Comprehensive
  - Output format: Markdown, HTML, PDF
- **AI Generation**: Uses Google Gemini AI to create comprehensive documentation
- **Preview & Download**: Review generated content and download in chosen format

## API Endpoints

### Authentication

- `GET/POST /api/auth/*` - NextAuth.js authentication routes

### GitHub Integration

- `GET /api/github/repositories` - Fetch user's GitHub repositories

### Documentation

- `POST /api/documents/generate` - Generate documentation for a repository

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Main dashboard
│   └── page.tsx           # Home page (redirects to auth/dashboard)
├── components/
│   ├── GitHubConnector.tsx    # GitHub connection interface
│   ├── RepositorySearch.tsx   # Repository search and selection
│   └── DocumentationGenerator.tsx # Documentation generation interface
├── lib/
│   └── prisma.ts          # Prisma client configuration
└── utils/
    └── gemini.ts          # Google Gemini AI utilities
```

## Troubleshooting

### Common Issues

1. **OAuth Errors**: Ensure callback URLs are correctly set in OAuth app settings
2. **Gemini API Errors**: Check if API key is valid and has sufficient quota
3. **Database Issues**: Run `npx prisma db push` to sync schema changes

### Environment Variables Checklist

- [ ] `NEXTAUTH_SECRET` - Secure random string
- [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- [ ] `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - From GitHub Developer Settings
- [ ] `GEMINI_API_KEY` - From Google AI Studio
- [ ] `DATABASE_URL` - Path to SQLite database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Deployment

### Local Development

```bash
npm run dev
```

Visit http://localhost:3000 to view the app.

### Production Build

```bash
npm run build
npm start
```

### GitHub Pages Deployment

This project is configured for GitHub Pages deployment. To deploy:

1. Push your changes to the GitHub repository
2. In GitHub, go to repository Settings > Pages
3. Set Source to "GitHub Actions"
4. GitHub will automatically deploy using the workflow

The site will be available at: https://ezdecode.github.io/GitDocument/

## License

This project is licensed under the MIT License.
