# Frontend Trochez Admin

Frontend application for Avalúos Trochez administrative panel. This web application provides an interface for managing property appraisals and related administrative tasks.

## Description

This project serves as the administrative interface for Avalúos Trochez, allowing staff to manage property appraisals, client information, and generate reports. The application is built with modern web technologies to provide a responsive and intuitive user experience.

## Technologies

- Svelte
- SvelteKit
- TailwindCSS
- Axios for API requests
- DaisyUI for UI components

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v22.x recommended, v16.x or later required)
- npm (v7.x or later) or yarn
- nvm (Node Version Manager) for managing Node.js versions

This project uses Node.js v22. If you have nvm installed, follow these steps:

```bash
# Install Node.js v22 if you don't have it yet
nvm install 22

# Set Node.js v22 as the active version for this project
nvm use 22
```

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd frontend-trochez-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Project

### Development Mode

To run the project in development mode with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Build for Production

To build the project for production:

```bash
npm run build
```

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check the project
- `npm run check:watch` - Type check the project in watch mode
