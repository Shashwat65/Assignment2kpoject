import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { selectItem } from '../redux/shapesSlice'

export default function Sidebar() {
  const dispatch = useDispatch()
  const { items, selectedId } = useSelector((s: RootState) => s.shapes.present)

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-panelAccent/50">
        <h2 className="font-medium text-sm uppercase tracking-wider text-primary">Layers</h2>
      </div>
      <ul className="flex-1 overflow-auto divide-y divide-panelAccent/40">
        {items.length === 0 && (
          <li className="px-4 py-6 text-sm text-white/60">No items yet. Use controls above to add.</li>
        )}
        {items.map((it, idx) => {
          const isSel = it.id === selectedId
          return (
            <li
              key={it.id}
              className={
                'px-4 py-3 text-sm hover:bg-panelAccent/40 cursor-pointer transition ' +
                (isSel ? 'bg-panelAccent/60 ring-1 ring-primary/50' : '')
              }
              onClick={() => dispatch(selectItem(it.id))}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  #{idx + 1} • {it.type}
                </div>
                <div className="text-xs text-white/60">{it.id}</div>
              </div>
              <div className="mt-1 text-xs text-white/70">
                pos: ({Math.round(it.x)}, {Math.round(it.y)}) • size: {Math.round(it.width)}×{Math.round(it.height)}
              </div>
            </li>
          )
        })}
      </ul>
      <div className="p-3 text-[11px] text-white/40 border-t border-panelAccent/50">
        Tip: Use arrow keys to nudge. Shift+arrow for 10px.
      </div>
    </div>
  )
}
