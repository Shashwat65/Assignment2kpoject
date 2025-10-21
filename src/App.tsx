import React from 'react'
import Controls from './components/Controls'
import Sidebar from './components/Sidebar'
import CanvasArea from './components/CanvasArea'

export default function App() {
  return (
    <div className="h-full grid grid-rows-[auto,1fr] bg-canvasBg text-textSoft">
      <header className="border-b border-panelAccent/50 bg-panel/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold tracking-tight">
            Mini Image Layout Editor
          </h1>
          <Controls />
        </div>
      </header>
      <main className="grid grid-cols-12 gap-0 overflow-hidden">
        <aside className="col-span-3 md:col-span-3 lg:col-span-3 border-r border-panelAccent/50 bg-panel overflow-y-auto">
          <Sidebar />
        </aside>
        <section className="col-span-9 md:col-span-9 lg:col-span-9 overflow-hidden">
          <CanvasArea />
        </section>
      </main>
    </div>
  )
}
