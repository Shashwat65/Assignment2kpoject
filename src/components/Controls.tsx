import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import {
  addRect,
  addImage,
  deleteSelected,
  undo,
  redo,
} from '../redux/shapesSlice'
import { loadState } from '../redux/shapesSlice'
import { restoreFromStorage, clearAll } from '../redux/shapesSlice'

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <button
    className={
      'px-3 py-1.5 rounded-md bg-panelAccent text-sm hover:bg-panelAccent/80 border border-white/5 shadow-sm transition ' +
      className
    }
    {...props}
  >
    {children}
  </button>
)

export default function Controls() {
  const dispatch = useDispatch()
  const selectedId = useSelector((s: RootState) => s.shapes.present.selectedId)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [qty, setQty] = useState(1)

  const onPickImage = () => fileRef.current?.click()
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    files.forEach((f) => {
      const url = URL.createObjectURL(f)
      dispatch(addImage(url))
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    })
    e.target.value = ''
  }

  return (
    <div className="flex items-center flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <Button onClick={() => dispatch(addRect())}>Add Rectangle</Button>
        <Button onClick={() => { dispatch(addRect({ width: 220, height: 140, x: 60, y: 60 })) }}>Add Wide</Button>
        <Button onClick={() => { dispatch(addRect({ width: 100, height: 100, x: 20, y: 20 })) }}>Add Square</Button>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={20}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(20, Number(e.target.value))))}
            className="w-14 bg-panelAccent/60 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Quantity"
            title="Quantity"
          />
          <Button
            onClick={() => {
              const n = Math.max(1, Math.min(20, qty || 1))
              for (let i = 0; i < n; i++) {
                const offset = i * 18
                dispatch(addRect({ x: 24 + offset, y: 24 + offset }))
              }
            }}
          >
            Add x{qty}
          </Button>
        </div>
        <Button onClick={onPickImage}>Add Image(s)</Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFile}
        />
      </div>
      <div className="w-px h-6 bg-white/10" />
      <div className="flex items-center gap-2">
        <Button onClick={() => dispatch(undo())}>Undo</Button>
        <Button onClick={() => dispatch(redo())}>Redo</Button>
      </div>
      <div className="w-px h-6 bg-white/10" />
      <Button
        onClick={() => dispatch(deleteSelected())}
        disabled={!selectedId}
        className={selectedId ? '' : 'opacity-50 cursor-not-allowed'}
      >
        Delete
      </Button>
      <div className="w-px h-6 bg-white/10" />
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            const s = loadState()
            if (s) dispatch(restoreFromStorage(s))
          }}
        >
          Load
        </Button>
        <Button onClick={() => dispatch(clearAll())}>Clear</Button>
      </div>
    </div>
  )
}
