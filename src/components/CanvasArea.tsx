import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Rect, Image as KImage, Transformer } from 'react-konva'
import Konva from 'konva'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import {
  selectItem,
  updateItem,
  nudgeSelected,
} from '../redux/shapesSlice'
import useImage from '../hooks/useImage'

const CANVAS_PADDING = 16

export default function CanvasArea() {
  const dispatch = useDispatch()
  const { items, selectedId } = useSelector((s: RootState) => s.shapes.present)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [bounds, setBounds] = useState({ w: 900, h: 600 })
  const trRef = useRef<Konva.Transformer | null>(null)

  // Resize canvas with container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      setBounds({ w: Math.max(320, rect.width), h: Math.max(320, rect.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Attach transformer to selected node
  const layerRef = useRef<Konva.Layer | null>(null)
  useEffect(() => {
    const layer = layerRef.current
    const tr = trRef.current
    if (!layer || !tr) return
    const node = layer.findOne(`#node-${selectedId}`)
    if (node) {
      tr.nodes([node as any])
      tr.getLayer()?.batchDraw()
    } else {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
    }
  }, [selectedId, items])

  // Keyboard nudging and delete
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const delta = e.shiftKey ? 10 : 1
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === 'ArrowUp') dispatch(nudgeSelected({ dx: 0, dy: -delta, bounds }))
      if (e.key === 'ArrowDown') dispatch(nudgeSelected({ dx: 0, dy: delta, bounds }))
      if (e.key === 'ArrowLeft') dispatch(nudgeSelected({ dx: -delta, dy: 0, bounds }))
      if (e.key === 'ArrowRight') dispatch(nudgeSelected({ dx: delta, dy: 0, bounds }))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch, bounds])

  const clampPos = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const nx = Math.min(Math.max(0, x), Math.max(0, bounds.w - width))
      const ny = Math.min(Math.max(0, y), Math.max(0, bounds.h - height))
      return { x: nx, y: ny }
    },
    [bounds]
  )

  return (
    <div ref={containerRef} className="h-full w-full bg-[#0a0f1d] relative">
      <div className="absolute inset-0 p-4">
        <div className="h-full w-full rounded-lg bg-[#0c142b] ring-1 ring-white/5 overflow-hidden">
          <Stage
            width={bounds.w - CANVAS_PADDING * 2}
            height={bounds.h - CANVAS_PADDING * 2}
            className="block mx-auto my-auto"
            style={{ background: '#0b1226' }}
            onMouseDown={(e) => {
              // deselect when clicking empty space
              const clickedOnEmpty = e.target === e.target.getStage()
              if (clickedOnEmpty) {
                dispatch(selectItem(null))
              }
            }}
          >
            <Layer ref={layerRef}>
              {items.map((it) => (
                <ItemNode
                  key={it.id}
                  item={it}
                  selected={selectedId === it.id}
                  onSelect={() => dispatch(selectItem(it.id))}
                  onChange={(changes) =>
                    dispatch(
                      updateItem({
                        id: it.id,
                        changes,
                      })
                    )
                  }
                  bounds={bounds}
                  clampPos={clampPos}
                />
              ))}
              <Transformer
                ref={trRef}
                rotateEnabled={false}
                boundBoxFunc={(oldBox, newBox) => {
                  // Restrict negative sizes
                  if (newBox.width < 20 || newBox.height < 20) {
                    return oldBox
                  }
                  // Keep within canvas
                  const maxW = bounds.w
                  const maxH = bounds.h
                  if (
                    newBox.x < 0 ||
                    newBox.y < 0 ||
                    newBox.x + newBox.width > maxW ||
                    newBox.y + newBox.height > maxH
                  ) {
                    return oldBox
                  }
                  return newBox
                }}
                anchorFill="#38bdf8"
                anchorStroke="#38bdf8"
                anchorCornerRadius={4}
                anchorSize={8}
                borderStroke="#38bdf8"
                borderDash={[4, 4]}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  )
}

type ItemNodeProps = {
  item: ReturnType<typeof mapItem>[0] extends never ? never : any
  selected: boolean
  onSelect: () => void
  onChange: (changes: any) => void
  bounds: { w: number; h: number }
  clampPos: (x: number, y: number, w: number, h: number) => { x: number; y: number }
}

function ItemNode({ item, selected, onSelect, onChange, bounds, clampPos }: ItemNodeProps) {
  const isRect = item.type === 'rect'
  const isImage = item.type === 'image'
  const img = useImage(isImage ? item.src : undefined)

  const dragBoundFunc = useMemo(() => {
    return (pos: Konva.Vector2d) => {
      const { x, y } = clampPos(pos.x, pos.y, item.width, item.height)
      return { x, y }
    }
  }, [item.width, item.height, clampPos])

  const commonProps = {
    id: `node-${item.id}`,
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    draggable: true,
    onDragEnd: (e: any) => {
      const node = e.target as Konva.Node & { x(): number; y(): number }
      const { x, y } = clampPos(node.x(), node.y(), item.width, item.height)
      onChange({ x, y })
    },
    dragBoundFunc,
    onClick: onSelect,
    onTap: onSelect,
    onTransformEnd: (e: any) => {
      const node = e.target as any
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      // Reset scales after transform to apply it to width/height
      node.scaleX(1)
      node.scaleY(1)
      const newWidth = Math.max(20, node.width() * scaleX)
      const newHeight = Math.max(20, node.height() * scaleY)
      const { x, y } = clampPos(node.x(), node.y(), newWidth, newHeight)
      onChange({ x, y, width: newWidth, height: newHeight })
    },
  }

  if (isRect) {
    return (
      <Rect
        {...(commonProps as any)}
        fill={item.fill || '#38bdf8'}
        cornerRadius={6}
        stroke={selected ? '#7dd3fc' : '#0ea5e9'}
        strokeWidth={selected ? 2 : 0}
        shadowColor="#000"
        shadowBlur={10}
        shadowOpacity={0.2}
      />
    )
  }

  if (isImage) {
    return (
      <KImage
        {...(commonProps as any)}
        image={img || undefined}
        stroke={selected ? '#7dd3fc' : undefined}
        strokeWidth={selected ? 2 : 0}
      />
    )
  }
  return null
}

// Helper to satisfy TypeScript in ItemNodeProps; not used for logic
function mapItem() {
  return [] as any[]
}
