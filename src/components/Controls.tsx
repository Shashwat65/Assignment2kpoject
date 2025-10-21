import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import {
  addRect,
  addImage,
  deleteSelected,
  undo,
  redo,
} from '../redux/shapesSlice'

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

  const onPickImage = () => fileRef.current?.click()
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    dispatch(addImage(url))
    // Revoke later; Konva keeps image in memory; revoking too early breaks drawing.
    setTimeout(() => URL.revokeObjectURL(url), 30000)
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => dispatch(addRect())}>Add Rectangle</Button>
      <Button onClick={onPickImage}>Add Image</Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      <div className="w-px h-6 bg-white/10 mx-1" />
      <Button onClick={() => dispatch(undo())}>Undo</Button>
      <Button onClick={() => dispatch(redo())}>Redo</Button>
      <div className="w-px h-6 bg-white/10 mx-1" />
      <Button
        onClick={() => dispatch(deleteSelected())}
        disabled={!selectedId}
        className={selectedId ? '' : 'opacity-50 cursor-not-allowed'}
      >
        Delete
      </Button>
    </div>
  )
}
