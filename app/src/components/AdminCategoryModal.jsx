import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '../services/api'

export default function AdminCategoryModal({ type, category, onClose, onSaved, onToast }) {
  const isEdit = !!category
  const [name, setName] = useState(category?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required.')
      return
    }

    setSaving(true)
    try {
      const result = isEdit
        ? await updateCategory(category.id, { type, name: name.trim() })
        : await createCategory({ type, name: name.trim() })
      onToast?.(result.message, 'success')
      await onSaved()
      onClose()
    } catch (err) {
      onToast?.(err.message, 'error')
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      const result = await deleteCategory(category.id)
      onToast?.(result.message, 'success')
      await onSaved()
      onClose()
    } catch (err) {
      onToast?.(err.message, 'error')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-sm shadow-xl my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-forest font-bold text-lg">
            {isEdit ? `Edit ${type}` : `New ${type}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-forest transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={type === 'Festival' ? 'e.g. Diwali' : type === 'Occasion' ? 'e.g. Wedding' : 'e.g. Happy'}
              autoFocus
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest transition-colors"
            />
            {isEdit && (
              <p className="text-xs text-gray-300 mt-1">
                Slug stays "{category.slug}" — renaming only changes the display label.
              </p>
            )}
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 text-sm hover:text-forest transition-colors px-4 py-3"
            >
              Cancel
            </button>
          </div>

          {isEdit && (
            <div className="pt-3 border-t border-taupe">
              {confirmDelete ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-red-400">Delete this category permanently?</p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      className="text-xs bg-red-400 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-gray-400 hover:text-forest transition-colors px-3 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-red-400 hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
