import React from 'react'
import Controls from './components/Controls'
import Sidebar from './components/Sidebar'
import CanvasArea from './components/CanvasArea'

export default function App() {
  return (
    <div className="h-full grid grid-rows-[auto,1fr] bg-canvasBg text-textSoft">
      <header className="border-b border-panelAccent/50 bg-panel/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 py-3 gap-3">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight whitespace-nowrap">
            Mini Image Layout Editor
          </h1>
          <div className="min-w-0 flex-1" />
          <Controls />
        </div>
      </header>
      <main className="grid grid-rows-[1fr_auto] md:grid-rows-1 md:grid-cols-12 gap-0 overflow-hidden">
        <section className="order-1 md:order-none md:col-span-9 overflow-hidden">
          <CanvasArea />
        </section>
        <aside className="order-2 md:order-none md:col-span-3 border-t md:border-t-0 md:border-l border-panelAccent/50 bg-panel overflow-y-auto max-h-[40vh] md:max-h-none">
          <Sidebar />
        </aside>
      </main>
    </div>
  )
}
