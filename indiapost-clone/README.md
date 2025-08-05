# India Post Clone

A modern clone of the India Post website built with React, TypeScript, and Vite.

## Features

- 🎨 Modern UI with responsive design
- 📱 Mobile-first approach
- 🚀 Fast performance with Vite
- 🔍 Track and Trace functionality
- 🤖 Integration with Savitr-AI Delivery Manager
- 🎯 Multiple utility services simulation

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/indiapost-clone.git
cd indiapost-clone
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SAVITR_AI_URL=http://localhost:3000
VITE_INDIA_POST_URL=http://localhost:5173
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

## Project Structure

```
indiapost-clone/
├── src/
│   ├── components/     # Reusable UI components
│   ├── config/         # Configuration files
│   ├── pages/          # Page components
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── public/             # Static assets
└── index.html          # Entry HTML file
```

## Integration with Savitr-AI

The project integrates with the Savitr-AI Delivery Manager through:
- Configurable URLs in `src/config/urls.ts`
- CORS-enabled communication
- Environment-based URL switching

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_SAVITR_AI_URL | URL for Savitr-AI integration | http://localhost:3000 |
| VITE_INDIA_POST_URL | Base URL for India Post clone | http://localhost:5173 |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- India Post for the original website design
- All contributors who have helped with the project
