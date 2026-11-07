import { useState } from 'react'
import { updateCategoryContent } from '../services/api'

const inputClass = 'w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest transition-colors'

// Google cuts titles/descriptions off around these lengths — shown as a soft guide, not enforced.
const SEO_TITLE_LIMIT = 60
const DESCRIPTION_LIMIT = 155

function CharCount({ value, limit }) {
  const over = value.length > limit
  return (
    <span className={`text-xs ${over ? 'text-red-400' : 'text-gray-300'}`}>
      {value.length}/{limit}
    </span>
  )
}

// Edits the landing-page text for one category page (e.g. /festivals/karwa-chauth).
// Saving with every field blank clears the content, so the page goes back to auto-generated text.
export default function AdminCategoryContentModal({ type, category, onClose, onSaved, onToast }) {
  const initial = category.content ?? {}
  const [seoTitle, setSeoTitle]       = useState(initial.seoTitle ?? '')
  const [description, setDescription] = useState(initial.description ?? '')
  const [heading, setHeading]         = useState(initial.heading ?? '')
  const [intro, setIntro]             = useState(initial.intro ?? '')
  const [sections, setSections]       = useState(initial.sections ?? [])
  const [faqs, setFaqs]               = useState(initial.faqs ?? [])
  const [saving, setSaving]           = useState(false)

  const pagePath = `/${type.toLowerCase()}s/${category.slug}`

  function updateItem(setList, index, field, value) {
    setList(list => list.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function removeItem(setList, index) {
    setList(list => list.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const result = await updateCategoryContent(category.id, { seoTitle, description, heading, intro, sections, faqs })
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
      <div className="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-2xl shadow-xl my-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-forest font-bold text-lg">Page content — {category.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-forest transition-colors">✕</button>
        </div>
        <a href={pagePath} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-forest hover:underline">
          snekart.in{pagePath} ↗
        </a>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">

          {/* Google */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-forest mb-2">How it appears on Google</legend>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">SEO title</label>
                <CharCount value={seoTitle} limit={SEO_TITLE_LIMIT} />
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)}
                placeholder={`${category.name} Gift Hampers in Lucknow – Snekart`}
                className={inputClass}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">Meta description</label>
                <CharCount value={description} limit={DESCRIPTION_LIMIT} />
              </div>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={`Shop ${category.name} gift hampers and kits from Snekart, delivered across Lucknow.`}
                className={inputClass}
              />
            </div>
          </fieldset>

          {/* Top of page */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-forest mb-2">Top of the page</legend>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Heading (H1)</label>
              <input
                type="text"
                value={heading}
                onChange={e => setHeading(e.target.value)}
                placeholder={`${category.name} Gift Hampers – Delivered in Lucknow`}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Intro (one or two sentences)</label>
              <textarea
                rows={2}
                value={intro}
                onChange={e => setIntro(e.target.value)}
                className={inputClass}
              />
            </div>
          </fieldset>

          {/* Sections */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-forest mb-2">Text sections (shown below the products)</legend>
            {sections.map((s, i) => (
              <div key={i} className="border border-taupe rounded-xl p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={s.title}
                    onChange={e => updateItem(setSections, i, 'title', e.target.value)}
                    placeholder="Section heading, e.g. What to put in a sargi hamper"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => removeItem(setSections, i)} className="text-xs text-red-400 hover:text-red-500 px-2">
                    Remove
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={s.body}
                  onChange={e => updateItem(setSections, i, 'body', e.target.value)}
                  placeholder="Section text. Leave an empty line between paragraphs."
                  className={inputClass}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSections(list => [...list, { title: '', body: '' }])}
              className="text-sm text-forest hover:underline"
            >
              + Add section
            </button>
          </fieldset>

          {/* FAQs */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-forest mb-2">FAQs</legend>
            {faqs.map((f, i) => (
              <div key={i} className="border border-taupe rounded-xl p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={f.q}
                    onChange={e => updateItem(setFaqs, i, 'q', e.target.value)}
                    placeholder="Question, e.g. Do you deliver in Lucknow?"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => removeItem(setFaqs, i)} className="text-xs text-red-400 hover:text-red-500 px-2">
                    Remove
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={f.a}
                  onChange={e => updateItem(setFaqs, i, 'a', e.target.value)}
                  placeholder="Answer"
                  className={inputClass}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFaqs(list => [...list, { q: '', a: '' }])}
              className="text-sm text-forest hover:underline"
            >
              + Add FAQ
            </button>
          </fieldset>

          <p className="text-xs text-gray-300">
            Blank fields fall back to auto-generated text. Write original text — copied text can hurt rankings.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Page Content'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 text-sm hover:text-forest transition-colors px-4 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
