# SSR Rendering on Bun

A layout-driven example SSR architecture.

Instead of the router calling a layout and pages separately, the layout calls the router, so each page can provide top-level page metadata such as document title and content for various meta tags.

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.
