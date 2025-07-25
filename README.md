# SmartTranslate - AI-Powered Document Translation

A Smartcat clone built with Next.js, ShadCN UI, Supabase, and OpenAI's O3 model for professional document translation.

## Features

- 🚀 **Modern Landing Page** - Beautiful, responsive design showcasing the platform
- 🔐 **Authentication System** - Secure login/signup with Supabase Auth
- 📄 **Document Translation** - Upload files or paste text for instant translation
- 🌍 **50+ Languages** - Support for major world languages
- 🤖 **AI-Powered** - Uses OpenAI's O3 model for accurate translations
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- ⚡ **Real-time** - Instant translation results

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Authentication**: Supabase Auth
- **AI Translation**: OpenAI API (O3 Model)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel-ready

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/riyeranand/alltechmarketingaiops.git
cd alltechmarketingaiops
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
```

### 4. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Update the `.env.local` file with your Supabase credentials

### 5. Set Up OpenAI

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key
3. Update the `.env.local` file with your OpenAI API key

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/translate/          # Translation API endpoint
│   ├── dashboard/              # Protected dashboard page
│   ├── login/                  # Authentication page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/ui/              # ShadCN UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── textarea.tsx
└── lib/
    ├── openai.ts               # OpenAI integration
    ├── supabase.ts             # Supabase client
    └── utils.ts                # Utility functions
```

## Features Walkthrough

### Landing Page
- Professional hero section with call-to-action
- Feature showcase with icons and descriptions
- Statistics section
- Footer with links

### Authentication
- Login/signup forms with validation
- Email verification for new accounts
- Secure session management with Supabase

### Dashboard
- File upload support (.txt, .doc, .docx)
- Text input with live preview
- Language selection dropdown (50+ languages)
- Real-time translation with OpenAI O3
- Copy and download translated text
- User session management

### Translation API
- Secure server-side API endpoint
- Input validation and error handling
- Integration with OpenAI's latest models
- Optimized for speed and accuracy

## Development

### Adding New Languages

Edit the `LANGUAGES` array in `src/app/dashboard/page.tsx`:

```typescript
const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  // Add more languages here
]
```

### Customizing UI

The project uses ShadCN UI components. You can:
- Modify components in `src/components/ui/`
- Update colors in `tailwind.config.js`
- Change global styles in `src/app/globals.css`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Current Status

This is a fully functional Smartcat clone with:
- ✅ Beautiful landing page
- ✅ Authentication system (requires Supabase setup)
- ✅ Translation dashboard
- ✅ File upload support
- ✅ Real-time translation (requires OpenAI API key)
- ✅ Responsive design
- ✅ Copy/download functionality

## Next Steps

To make this production-ready, consider adding:
- Rate limiting for API calls
- User usage analytics
- Payment integration
- Advanced file format support
- Team collaboration features
- Translation history and saved translations

## License

This project is licensed under the MIT License.
