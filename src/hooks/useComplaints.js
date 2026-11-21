import { useCallback, useRef, useState } from 'react'
import { CATEGORIES, PRIORITIES, STATUSES } from '../lib/constants'
import { cloneSeed, loadStore, saveStore } from '../lib/storage'

function nextNumber(items, prefix) {
  const highest = items.reduce((max, item) => {
    const match = String(item.id).match(new RegExp(`^${prefix}-(\\d+)$`))
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)

  return highest + 1
}

function makeEvent(current, complaintId, type, text, now) {
  return {
    id: `e-${nextNumber(current.events, 'e')}`,
    complaintId,
    type,
    text,
    actorId: current.staff[0]?.id ?? 's1',
    createdAt: now,
  }
}

export function useComplaints() {
  const [state, setState] = useState(() => loadStore())
  const storeRef = useRef(state.store)
  storeRef.current = state.store

  const currentUser = state.store.staff[0] ?? {
    id: 's1',
    name: 'Unknown',
    role: '',
  }

  const commit = useCallback((next) => {
    storeRef.current = next
    const saved = saveStore(next)

    setState((previous) => ({
      store: next,
      status: saved
        ? previous.status === 'unavailable'
          ? 'loaded'
          : previous.status
        : 'unavailable',
    }))

    return saved
  }, [])

  const createComplaint = useCallback(
    (input = {}) => {
      const current = storeRef.current
      const now = new Date().toISOString()
      const counter = current.counter + 1

      const complaint = {
        id: `c-${counter}`,
        reference: `CMP-${String(counter).padStart(4, '0')}`,
        customerName: input.customerName?.trim() ?? '',
        customerEmail: input.customerEmail?.trim() ?? '',
        customerPhone: input.customerPhone?.trim() ?? '',
        subject: input.subject?.trim() ?? '',
        description: input.description?.trim() ?? '',
        category: input.category ?? CATEGORIES[0],
        priority: input.priority ?? 'Medium',
        status: 'New',
        assigneeId: input.assigneeId ?? null,
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
      }

      const event = makeEvent(
        current,
        complaint.id,
        'created',
        'Complaint logged',
        now,
      )

      commit({
        ...current,
        counter,
        complaints: [complaint, ...current.complaints],
        events: [...current.events, event],
      })

      return complaint
    },
    [commit],
  )

  const updateStatus = useCallback(
    (id, status) => {
      if (!STATUSES.includes(status)) return null

      const current = storeRef.current
      const complaint = current.complaints.find((item) => item.id === id)
      if (!complaint || complaint.status === status) return null

      const now = new Date().toISOString()
      const updated = {
        ...complaint,
        status,
        updatedAt: now,
        resolvedAt: status === 'Resolved' ? now : null,
      }
      const event = makeEvent(
        current,
        id,
        'status',
        `Status changed from ${complaint.status} to ${status}`,
        now,
      )

      commit({
        ...current,
        complaints: current.complaints.map((item) =>
          item.id === id ? updated : item,
        ),
        events: [...current.events, event],
      })

      return updated
    },
    [commit],
  )

  const updatePriority = useCallback(
    (id, priority) => {
      if (!PRIORITIES.includes(priority)) return null

      const current = storeRef.current
      const complaint = current.complaints.find((item) => item.id === id)
      if (!complaint || complaint.priority === priority) return null

      const now = new Date().toISOString()
      const updated = { ...complaint, priority, updatedAt: now }
      const event = makeEvent(
        current,
        id,
        'priority',
        `Priority changed from ${complaint.priority} to ${priority}`,
        now,
      )

      commit({
        ...current,
        complaints: current.complaints.map((item) =>
          item.id === id ? updated : item,
        ),
        events: [...current.events, event],
      })

      return updated
    },
    [commit],
  )

  const updateAssignee = useCallback(
    (id, staffId) => {
      const current = storeRef.current
      const complaint = current.complaints.find((item) => item.id === id)
      const nextAssigneeId = staffId || null
      if (!complaint || complaint.assigneeId === nextAssigneeId) return null

      const oldName =
        current.staff.find((person) => person.id === complaint.assigneeId)
          ?.name ?? null
      const newName =
        current.staff.find((person) => person.id === nextAssigneeId)?.name ??
        null

      if (nextAssigneeId && !newName) return null

      let text = ''
      if (!oldName && newName) text = `Assigned to ${newName}`
      else if (oldName && newName) text = `Reassigned from ${oldName} to ${newName}`
      else if (oldName && !newName) text = `Unassigned (was ${oldName})`
      else return null

      const now = new Date().toISOString()
      const updated = {
        ...complaint,
        assigneeId: nextAssigneeId,
        updatedAt: now,
      }
      const event = makeEvent(current, id, 'assignee', text, now)

      commit({
        ...current,
        complaints: current.complaints.map((item) =>
          item.id === id ? updated : item,
        ),
        events: [...current.events, event],
      })

      return updated
    },
    [commit],
  )

  const addNote = useCallback(
    (id, text) => {
      const trimmed = text.trim()
      if (!trimmed) return null

      const current = storeRef.current
      const complaint = current.complaints.find((item) => item.id === id)
      if (!complaint) return null

      const now = new Date().toISOString()
      const event = makeEvent(current, id, 'note', trimmed, now)
      const updated = { ...complaint, updatedAt: now }

      commit({
        ...current,
        complaints: current.complaints.map((item) =>
          item.id === id ? updated : item,
        ),
        events: [...current.events, event],
      })

      return event
    },
    [commit],
  )

  const resetData = useCallback(() => {
    const fresh = cloneSeed()
    const next = {
      ...fresh,
      // Keep the reference counter so a demo reset cannot reuse a number.
      counter: Math.max(fresh.counter, storeRef.current.counter),
    }

    commit(next)
    return next
  }, [commit])

  return {
    complaints: state.store.complaints,
    events: state.store.events,
    staff: state.store.staff,
    currentUser,
    storageStatus: state.status,
    createComplaint,
    updateStatus,
    updatePriority,
    updateAssignee,
    addNote,
    resetData,
  }
}
