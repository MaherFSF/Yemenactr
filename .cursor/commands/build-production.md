# Build for Production

Create a production-ready build of the application.

```bash
pnpm build
```

This will:
1. Build the client with Vite (optimized React bundle)
2. Build the server with esbuild (Node.js bundle)
3. Output to `dist/` directory

To test the production build locally:

```bash
pnpm start
```

The application will start on port 5000 (or PORT env variable).
