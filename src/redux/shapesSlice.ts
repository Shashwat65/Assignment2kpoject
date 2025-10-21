import { PayloadAction, createSlice, nanoid } from '@reduxjs/toolkit'

export type ShapeType = 'rect' | 'image'

export type BaseItem = {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  rotation?: number
}

export type RectItem = BaseItem & { type: 'rect'; fill?: string }
export type ImageItem = BaseItem & { type: 'image'; src: string }
export type ShapeItem = RectItem | ImageItem

type PresentState = {
  items: ShapeItem[]
  selectedId: string | null
}

type ShapesState = {
  past: PresentState[]
  present: PresentState
  future: PresentState[]
}

const STORAGE_KEY = 'mini-image-layout-editor-state-v1'

function loadInitial(): ShapesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ShapesState
      // Basic validation
      if (parsed && parsed.present && Array.isArray(parsed.present.items)) {
        return parsed
      }
    }
  } catch {}
  return {
    past: [],
    present: { items: [], selectedId: null },
    future: [],
  }
}

const initialState: ShapesState = loadInitial()

// Utility to push current present into past for undo stack
function pushHistory(state: ShapesState) {
  state.past.push(structuredClone(state.present))
  state.future = [] // clear redo on new action
}

const shapesSlice = createSlice({
  name: 'shapes',
  initialState,
  reducers: {
    addRect: {
      prepare(partial?: Partial<RectItem>) {
        return {
          payload: {
            id: nanoid(8),
            type: 'rect' as const,
            x: 40,
            y: 40,
            width: 150,
            height: 100,
            fill: '#38bdf8',
            rotation: 0,
            ...partial,
          },
        }
      },
      reducer(state, action: PayloadAction<RectItem>) {
        pushHistory(state)
        state.present.items.push(action.payload)
        state.present.selectedId = action.payload.id
      },
    },
    addImage: {
      prepare(src: string, partial?: Partial<ImageItem>) {
        return {
          payload: {
            id: nanoid(8),
            type: 'image' as const,
            src,
            x: 80,
            y: 80,
            width: 200,
            height: 140,
            rotation: 0,
            ...partial,
          },
        }
      },
      reducer(state, action: PayloadAction<ImageItem>) {
        pushHistory(state)
        state.present.items.push(action.payload)
        state.present.selectedId = action.payload.id
      },
    },
    selectItem(state, action: PayloadAction<string | null>) {
      state.present.selectedId = action.payload
    },
    updateItem(
      state,
      action: PayloadAction<{ id: string; changes: Partial<ShapeItem> }>
    ) {
      pushHistory(state)
      const { id, changes } = action.payload
      const item = state.present.items.find((i) => i.id === id)
      if (item) {
        Object.assign(item, changes)
      }
    },
    nudgeSelected(
      state,
      action: PayloadAction<{ dx: number; dy: number; bounds: { w: number; h: number } }>
    ) {
      const { dx, dy, bounds } = action.payload
      const id = state.present.selectedId
      if (!id) return
      pushHistory(state)
      const item = state.present.items.find((i) => i.id === id)
      if (item) {
        // Clamp within canvas
        const nx = Math.min(Math.max(0, item.x + dx), Math.max(0, bounds.w - item.width))
        const ny = Math.min(Math.max(0, item.y + dy), Math.max(0, bounds.h - item.height))
        item.x = nx
        item.y = ny
      }
    },
    deleteSelected(state) {
      const id = state.present.selectedId
      if (!id) return
      pushHistory(state)
      state.present.items = state.present.items.filter((i) => i.id !== id)
      state.present.selectedId = null
    },
    clearAll(state) {
      pushHistory(state)
      state.present.items = []
      state.present.selectedId = null
    },
    undo(state) {
      if (state.past.length === 0) return
      const prev = state.past.pop()!
      state.future.unshift(structuredClone(state.present))
      state.present = prev
    },
    redo(state) {
      if (state.future.length === 0) return
      const next = state.future.shift()!
      state.past.push(structuredClone(state.present))
      state.present = next
    },
    restoreFromStorage(state, action: PayloadAction<ShapesState>) {
      return action.payload
    },
  },
})

export const {
  addRect,
  addImage,
  selectItem,
  updateItem,
  nudgeSelected,
  deleteSelected,
  clearAll,
  undo,
  redo,
  restoreFromStorage,
} = shapesSlice.actions

export default shapesSlice.reducer

export function persistState(state: ShapesState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function loadState(): ShapesState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ShapesState
  } catch {
    return null
  }
}

export type { ShapesState, PresentState }
