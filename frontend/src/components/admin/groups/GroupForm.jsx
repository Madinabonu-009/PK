import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import './GroupForm.css'

const AGE_RANGES = [
  { id: '1-2', label: '1-2 yosh', min: 1, max: 2 },
  { id: '2-3', label: '2-3 yosh', min: 2, max: 3 },
  { id: '3-4', label: '3-4 yosh', min: 3, max: 4 },
  { id: '4-5', label: '4-5 yosh', min: 4, max: 5 },
  { id: '5-6', label: '5-6 yosh', min: 5, max: 6 },
  { id: '6-7', label: '6-7 yosh', min: 6, max: 7 }
]

const TEACHER_ROLES = [
  { id: 'lead', label: 'Asosiy tarbiyachi' },
  { id: 'assistant', label: 'Yordamchi tarbiyachi' },
  { id: 'specialist', label: 'Mutaxassis' }
]

export default function GroupForm({ 
  isOpen, 
  onClose, 
  onSave,
  group = null,
  teachers = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    ageRange: '3-4',
    capacity: 20,
    description: '',
    color: '#3b82f6',
    assignedTeachers: []
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        ageRange: group.ageRange || '3-4',
        capacity: group.capacity || 20,
        description: group.description || '',
        color: group.color || '#3b82f6',
        assignedTeachers: group.teachers || []
      })
    } else {
      setFormData({
        name: '',
        ageRange: '3-4',
        capacity: 20,
        description: '',
        color: '#3b82f6',
        assignedTeachers: []
      })
    }
    setErrors({})
  }, [group, isOpen])

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Guruh nomi kiritilishi shart'
    }
    if (formData.capacity < 5 || formData.capacity > 50) {
      newErrors.capacity = 'Sig\'im 5 dan 50 gacha bo\'lishi kerak'
    }
    if (formData.assignedTeachers.length === 0) {
      newErrors.teachers = 'Kamida bitta tarbiyachi tayinlanishi kerak'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await onSave({
        ...formData,
        id: group?.id
      })
      onClose()
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleTeacherToggle = (teacherId, role) => {
    setFormData(prev => {
      const existing = prev.assignedTeachers.find(t => t.id === teacherId)
      if (existing) {
        return {
          ...prev,
          assignedTeachers: prev.assignedTeachers.filter(t => t.id !== teacherId)
        }
      }
      return {
        ...prev,
        assignedTeachers: [...prev.assignedTeachers, { id: teacherId, role }]
      }
    })
  }

  const handleTeacherRoleChange = (teacherId, role) => {
    setFormData(prev => ({
      ...prev,
      assignedTeachers: prev.assignedTeachers.map(t => 
        t.id === teacherId ? { ...t, role } : t
      )
    }))
  }

  if (!isOpen) return null

  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

  return (
    <AnimatePresence>
      <motion.div
        className="group-form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="group-form__backdrop" onClick={onClose} />
        
        <motion.div
          className="group-form__content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="group-form__header">
            <h2 className="group-form__title">
              {group ? 'Guruhni tahrirlash' : 'Yangi guruh'}
            </h2>
            <button className="group-form__close" onClick={onClose}>×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="group-form__body">
              <div className="group-form__row">
                <div className="group-form__field">
                  <label className="group-form__label">Guruh nomi *</label>
                  <input
                    type="text"
                    className={`group-form__input ${errors.name ? 'group-form__input--error' : ''}`}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masalan: Quyosh"
                  />
                  {errors.name && <p className="group-form__error">{errors.name}</p>}
                </div>

                <div className="group-form__field">
                  <label className="group-form__label">Yosh oralig'i</label>
                  <select
                    className="group-form__select"
                    value={formData.ageRange}
                    onChange={(e) => setFormData(prev => ({ ...prev, ageRange: e.target.value }))}
                  >
                    {AGE_RANGES.map(range => (
                      <option key={range.id} value={range.id}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="group-form__row">
                <div className="group-form__field">
                  <label className="group-form__label">Sig'im (bolalar soni)</label>
                  <input
                    type="number"
                    className={`group-form__input ${errors.capacity ? 'group-form__input--error' : ''}`}
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    min={5}
                    max={50}
                  />
                  {errors.capacity && <p className="group-form__error">{errors.capacity}</p>}
                </div>

                <div className="group-form__field">
                  <label className="group-form__label">Rang</label>
                  <div className="group-form__color-picker">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`group-form__color ${formData.color === color ? 'group-form__color--selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="group-form__field">
                <label className="group-form__label">Tavsif</label>
                <textarea
                  className="group-form__textarea"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Guruh haqida qisqacha ma'lumot..."
                />
              </div>

              <div className="group-form__field">
                <h4 className="group-form__section-title">Tarbiyachilar *</h4>
                {errors.teachers && <p className="group-form__error">{errors.teachers}</p>}
                <div className="group-form__teachers">
                  {teachers.map(teacher => {
                    const assigned = formData.assignedTeachers.find(t => t.id === teacher.id)
                    return (
                      <div
                        key={teacher.id}
                        className={`group-form__teacher ${assigned ? 'group-form__teacher--selected' : ''}`}
                        onClick={() => handleTeacherToggle(teacher.id, 'lead')}
                      >
                        <img 
                          src={teacher.avatar || '/default-avatar.png'} 
                          alt={teacher.name}
                          className="group-form__teacher-avatar"
                        />
                        <div className="group-form__teacher-info">
                          <div className="group-form__teacher-name">{teacher.name}</div>
                          <div className="group-form__teacher-specialty">{teacher.specialty}</div>
                        </div>
                        {assigned && (
                          <select
                            className="group-form__teacher-role"
                            value={assigned.role}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleTeacherRoleChange(teacher.id, e.target.value)}
                          >
                            {TEACHER_ROLES.map(role => (
                              <option key={role.id} value={role.id}>{role.label}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {errors.submit && (
                <p className="group-form__error" style={{ textAlign: 'center' }}>
                  {errors.submit}
                </p>
              )}
            </div>

            <div className="group-form__footer">
              <button 
                type="button"
                className="group-form__btn group-form__btn--cancel"
                onClick={onClose}
              >
                Bekor qilish
              </button>
              <button 
                type="submit"
                className="group-form__btn group-form__btn--save"
                disabled={saving}
              >
                {saving ? 'Saqlanmoqda...' : (group ? 'Saqlash' : 'Yaratish')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

GroupForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  group: PropTypes.object,
  teachers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    specialty: PropTypes.string
  }))
}
