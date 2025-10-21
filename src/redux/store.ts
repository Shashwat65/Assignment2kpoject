import { configureStore } from '@reduxjs/toolkit'
import shapesReducer, { persistState } from './shapesSlice'

export const store = configureStore({
  reducer: {
    shapes: shapesReducer,
  },
})

// Persist to localStorage on changes (debounced via microtask)
let persistQueued = false
store.subscribe(() => {
  if (persistQueued) return
  persistQueued = true
  queueMicrotask(() => {
    persistQueued = false
    const state = store.getState()
    persistState(state.shapes)
  })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
