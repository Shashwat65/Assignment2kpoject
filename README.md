# Mini Image Layout Editor

A small but capable canvas editor built with React, Redux Toolkit, and React-Konva. Add rectangles and images, drag/resize with Transformer, manage layers from the sidebar, and undo/redo your changes. State persists to LocalStorage.

## Stack
- React 18 + Vite
- Redux Toolkit + React-Redux
- Konva + React-Konva
- TailwindCSS

## Features
- Add rectangles and images
- Select, drag, and resize using Konva Transformer
- Delete selected item
- Live sidebar with items list (id, type, position, size)
- Click in sidebar to select/highlight on canvas
- Arrow keys to nudge (Shift+Arrow = 10px)
- Prevent moving/resizing beyond canvas bounds
- Upload custom images
- Undo / Redo
- LocalStorage persistence

## Getting started

1) Install dependencies

```bash
npm install
```

2) Start the dev server

```bash
npm run dev
```

Open the printed localhost URL. Use the header controls to add a rectangle or upload an image. Select items on the canvas or via the sidebar. Drag handles to resize.

## Project structure
- `src/redux/shapesSlice.ts` – Shapes state, undo/redo, persistence
- `src/redux/store.ts` – Store setup and LocalStorage subscription
- `src/components/CanvasArea.tsx` – Konva Stage/Layer, item nodes, selection and transforms
- `src/components/Sidebar.tsx` – Layers list
- `src/components/Controls.tsx` – Header actions (add rect/image, undo/redo, delete)
- `src/App.tsx` – Layout (header • sidebar • canvas)

## Notes
- Images loaded from local files are kept with `createObjectURL`; we release the URL after a delay to avoid flicker.
- Transformer has rotate disabled to keep interactions focused and simple.

## Deploy
This project works great on Vercel. Build command: `npm run build`, output directory: `dist`.

