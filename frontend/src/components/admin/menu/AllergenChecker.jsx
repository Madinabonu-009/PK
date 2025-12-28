import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AllergenChecker.css'

// Allergen Icons and Info
const ALLERGEN_INFO = {
  milk: { 
    icon: '🥛', 
    name: 'Sut', 
    description: 'Sut va sut mahsulotlari',
    severity: 'high',
    alternatives: ['Soya suti', 'Bodom suti', 'Kokos suti']
  },
  eggs: { 
    icon: '🥚', 
    name: 'Tuxum', 
    description: 'Tuxum va tuxum mahsulotlari',
    severity: 'high',
    alternatives: ['Chia urug\'i', 'Banan', 'Tofu']
  },
  nuts: { 
    icon: '🥜', 
    name: 'Yong\'oq', 
    description: 'Yeryong\'oq va daraxt yong\'oqlari',
    severity: 'critical',
    alternatives: ['Urug\'lar', 'Kokos']
  },
  gluten: { 
    icon: '🌾', 
    name: 'Gluten', 
    description: 'Bug\'doy, arpa, javdar',
    severity: 'medium',
    alternatives: ['Guruch uni', 'Makkajo\'xori uni', 'Grechixa']
  },
  fish: { 
    icon: '🐟', 
    name: 'Baliq', 
    description: 'Baliq va baliq mahsulotlari',
    severity: 'high',
    alternatives: ['Tofu', 'Loviya', 'Go\'sht']
  },
  soy: { 
    icon: '🫘', 
    name: 'Soya', 
    description: 'Soya va soya mahsulotlari',
    severity: 'medium',
    alternatives: ['Kokos aminos', 'Boshqa dukkaklilar']
  },
  shellfish: {
    icon: '🦐',
    name: 'Dengiz mahsulotlari',
    description: 'Qisqichbaqalar, midiyalar',
    severity: 'critical',
    alternatives: ['Baliq', 'Tofu']
  },
  sesame: {
    icon: '🌱',
    name: 'Kunjut',
    description: 'Kunjut urug\'lari va yog\'i',
    severity: 'medium',
    alternatives: ['Boshqa urug\'lar', 'Zaytun yog\'i']
  }
}

// Severity Colors
const SEVERITY_COLORS = {
  critical: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' },
  high: { bg: '#fff7ed', border: '#f97316', text: '#c2410c' },
  medium: { bg: '#fefce8', border: '#eab308', text: '#a16207' }
}

// Allergen Warning Card
function AllergenWarningCard({ allergen, affectedChildren, onViewChildren, onSuggestAlternative }) {
  const info = ALLERGEN_INFO[allergen] || { icon: '⚠️', name: allergen, severity: 'medium' }
  const colors = SEVERITY_COLORS[info.severity]

  return (
    <motion.div
      className="allergen-warning-card"
      style={{ 
        backgroundColor: colors.bg, 
        borderColor: colors.border 
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="warning-header">
        <span className="allergen-icon">{info.icon}</span>
        <div className="warning-info">
          <h4 style={{ color: colors.text }}>{info.name}</h4>
          <p>{info.description}</p>
        </div>
        <span className={`severity-badge ${info.severity}`}>
          {info.severity === 'critical' ? 'Juda xavfli' : 
           info.severity === 'high' ? 'Xavfli' : 'O\'rtacha'}
        </span>
      </div>

      <div className="affected-children">
        <span className="children-count">
          👶 {affectedChildren.length} ta bola
        </span>
        <div className="children-avatars">
          {affectedChildren.slice(0, 5).map((child, idx) => (
            <div 
              key={child.id} 
              className="child-avatar"
              title={`${child.firstName} ${child.lastName}`}
              style={{ zIndex: 5 - idx }}
            >
              {child.photo ? (
                <img src={child.photo} alt={child.firstName} />
              ) : (
                <span>{child.firstName[0]}</span>
              )}
            </div>
          ))}
          {affectedChildren.length > 5 && (
            <div className="child-avatar more">
              +{affectedChildren.length - 5}
            </div>
          )}
        </div>
      </div>

      <div className="warning-actions">
        <button 
          className="action-btn view"
          onClick={() => onViewChildren?.(affectedChildren, allergen)}
        >
          👁️ Bolalarni ko'rish
        </button>
        <button 
          className="action-btn suggest"
          onClick={() => onSuggestAlternative?.(allergen)}
        >
          💡 Alternativa
        </button>
      </div>
    </motion.div>
  )
}

// Affected Children Modal
function AffectedChildrenModal({ children, allergen, onClose }) {
  const info = ALLERGEN_INFO[allergen] || { icon: '⚠️', name: allergen }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="affected-children-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{info.icon} {info.name} allergiyasi bor bolalar</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="children-list">
          {children.map(child => (
            <div key={child.id} className="child-item">
              <div className="child-photo">
                {child.photo ? (
                  <img src={child.photo} alt={child.firstName} />
                ) : (
                  <span className="photo-placeholder">
                    {child.firstName[0]}{child.lastName[0]}
                  </span>
                )}
              </div>
              <div className="child-info">
                <h4>{child.firstName} {child.lastName}</h4>
                <p className="child-group">{child.groupName || 'Guruh belgilanmagan'}</p>
                {child.allergies && child.allergies.length > 1 && (
                  <div className="other-allergies">
                    <span>Boshqa allergiyalar:</span>
                    {child.allergies
                      .filter(a => a !== allergen)
                      .map(a => (
                        <span key={a} className="allergen-mini">
                          {ALLERGEN_INFO[a]?.icon || '⚠️'}
                        </span>
                      ))
                    }
                  </div>
                )}
              </div>
              <div className="child-contact">
                <a href={`tel:${child.parentPhone}`} className="contact-btn">
                  📞 Ota-ona
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Yopish
          </button>
          <button className="btn-primary">
            📋 Ro'yxatni eksport qilish
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Alternative Suggestions Modal
function AlternativeSuggestionsModal({ allergen, currentMeal, recipes, onSelectAlternative, onClose }) {
  const info = ALLERGEN_INFO[allergen] || { alternatives: [] }
  
  // Filter recipes that don't contain this allergen
  const safeRecipes = useMemo(() => {
    return recipes?.filter(recipe => 
      !recipe.allergens?.includes(allergen)
    ) || []
  }, [recipes, allergen])

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="alternatives-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>💡 {ALLERGEN_INFO[allergen]?.name || allergen}siz alternativalar</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="alternatives-content">
          {/* Ingredient Alternatives */}
          <div className="alternatives-section">
            <h3>🥗 Ingredient almashtirishlari</h3>
            <div className="ingredient-alternatives">
              {info.alternatives?.map((alt, idx) => (
                <div key={idx} className="alternative-item">
                  <span className="alt-icon">✓</span>
                  <span>{alt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Recipes */}
          <div className="alternatives-section">
            <h3>📚 Xavfsiz retseptlar ({safeRecipes.length})</h3>
            <div className="safe-recipes-list">
              {safeRecipes.length > 0 ? (
                safeRecipes.slice(0, 6).map(recipe => (
                  <div 
                    key={recipe.id} 
                    className="safe-recipe-card"
                    onClick={() => onSelectAlternative?.(recipe)}
                  >
                    <div className="recipe-preview">
                      {recipe.image ? (
                        <img src={recipe.image} alt={recipe.name} />
                      ) : (
                        <span className="recipe-icon">🍽️</span>
                      )}
                    </div>
                    <div className="recipe-info">
                      <h4>{recipe.name}</h4>
                      <div className="recipe-meta">
                        <span>🔥 {recipe.calories || 0} kkal</span>
                        <span>💰 {(recipe.cost || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="select-btn">Tanlash</button>
                  </div>
                ))
              ) : (
                <div className="no-recipes">
                  <span>📋</span>
                  <p>Xavfsiz retsept topilmadi</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Yopish
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Allergen Checker Component
function AllergenChecker({
  menuItems = [],
  children = [],
  recipes = [],
  onUpdateMenu
}) {
  const [showAffectedChildren, setShowAffectedChildren] = useState(null)
  const [showAlternatives, setShowAlternatives] = useState(null)
  const [selectedMeal, setSelectedMeal] = useState(null)

  // Analyze menu for allergen conflicts
  const allergenAnalysis = useMemo(() => {
    const conflicts = {}
    const childrenByAllergen = {}

    // Group children by their allergies
    children.forEach(child => {
      if (child.allergies && child.allergies.length > 0) {
        child.allergies.forEach(allergen => {
          if (!childrenByAllergen[allergen]) {
            childrenByAllergen[allergen] = []
          }
          childrenByAllergen[allergen].push(child)
        })
      }
    })

    // Check each menu item for allergen conflicts
    menuItems.forEach(item => {
      if (item.allergens && item.allergens.length > 0) {
        item.allergens.forEach(allergen => {
          if (childrenByAllergen[allergen] && childrenByAllergen[allergen].length > 0) {
            if (!conflicts[allergen]) {
              conflicts[allergen] = {
                allergen,
                affectedChildren: childrenByAllergen[allergen],
                menuItems: []
              }
            }
            conflicts[allergen].menuItems.push(item)
          }
        })
      }
    })

    return {
      conflicts: Object.values(conflicts),
      totalAffectedChildren: new Set(
        Object.values(conflicts).flatMap(c => c.affectedChildren.map(ch => ch.id))
      ).size,
      hasConflicts: Object.keys(conflicts).length > 0
    }
  }, [menuItems, children])

  // Summary statistics
  const stats = useMemo(() => {
    const childrenWithAllergies = children.filter(c => c.allergies && c.allergies.length > 0)
    const allergenCounts = {}
    
    childrenWithAllergies.forEach(child => {
      child.allergies.forEach(allergen => {
        allergenCounts[allergen] = (allergenCounts[allergen] || 0) + 1
      })
    })

    return {
      totalChildren: children.length,
      childrenWithAllergies: childrenWithAllergies.length,
      allergenCounts,
      mostCommonAllergen: Object.entries(allergenCounts)
        .sort((a, b) => b[1] - a[1])[0]
    }
  }, [children])

  const handleViewChildren = (affectedChildren, allergen) => {
    setShowAffectedChildren({ children: affectedChildren, allergen })
  }

  const handleSuggestAlternative = (allergen) => {
    setShowAlternatives(allergen)
  }

  const handleSelectAlternative = (recipe) => {
    if (selectedMeal) {
      onUpdateMenu?.(selectedMeal, recipe)
    }
    setShowAlternatives(null)
    setSelectedMeal(null)
  }

  return (
    <div className="allergen-checker">
      {/* Header */}
      <div className="checker-header">
        <div className="header-title">
          <h2>⚠️ Allergen tekshiruvi</h2>
          <span className={`status-badge ${allergenAnalysis.hasConflicts ? 'warning' : 'safe'}`}>
            {allergenAnalysis.hasConflicts 
              ? `${allergenAnalysis.conflicts.length} ta ogohlantirish`
              : 'Xavfsiz'}
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="allergen-stats">
        <div className="stat-card">
          <span className="stat-icon">👶</span>
          <div className="stat-info">
            <span className="stat-value">{stats.childrenWithAllergies}</span>
            <span className="stat-label">Allergiyali bolalar</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <span className="stat-value">
              {stats.totalChildren > 0 
                ? Math.round((stats.childrenWithAllergies / stats.totalChildren) * 100)
                : 0}%
            </span>
            <span className="stat-label">Foiz</span>
          </div>
        </div>
        {stats.mostCommonAllergen && (
          <div className="stat-card highlight">
            <span className="stat-icon">
              {ALLERGEN_INFO[stats.mostCommonAllergen[0]]?.icon || '⚠️'}
            </span>
            <div className="stat-info">
              <span className="stat-value">{stats.mostCommonAllergen[1]}</span>
              <span className="stat-label">
                Eng ko'p: {ALLERGEN_INFO[stats.mostCommonAllergen[0]]?.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Allergen Distribution */}
      <div className="allergen-distribution">
        <h3>Allergiya taqsimoti</h3>
        <div className="distribution-bars">
          {Object.entries(stats.allergenCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([allergen, count]) => {
              const percentage = (count / stats.childrenWithAllergies) * 100
              const info = ALLERGEN_INFO[allergen]
              return (
                <div key={allergen} className="distribution-item">
                  <div className="item-label">
                    <span className="allergen-icon">{info?.icon || '⚠️'}</span>
                    <span>{info?.name || allergen}</span>
                    <span className="count">{count}</span>
                  </div>
                  <div className="bar-container">
                    <motion.div 
                      className="bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      style={{ 
                        backgroundColor: SEVERITY_COLORS[info?.severity || 'medium'].border 
                      }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Warnings */}
      {allergenAnalysis.hasConflicts && (
        <div className="warnings-section">
          <h3>🚨 Menyu ogohlantirishlari</h3>
          <div className="warnings-list">
            <AnimatePresence>
              {allergenAnalysis.conflicts.map(conflict => (
                <AllergenWarningCard
                  key={conflict.allergen}
                  allergen={conflict.allergen}
                  affectedChildren={conflict.affectedChildren}
                  onViewChildren={handleViewChildren}
                  onSuggestAlternative={handleSuggestAlternative}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Safe Status */}
      {!allergenAnalysis.hasConflicts && menuItems.length > 0 && (
        <div className="safe-status">
          <span className="safe-icon">✅</span>
          <h3>Menyu xavfsiz</h3>
          <p>Hozirgi menyu barcha bolalar uchun xavfsiz</p>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAffectedChildren && (
          <AffectedChildrenModal
            children={showAffectedChildren.children}
            allergen={showAffectedChildren.allergen}
            onClose={() => setShowAffectedChildren(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAlternatives && (
          <AlternativeSuggestionsModal
            allergen={showAlternatives}
            currentMeal={selectedMeal}
            recipes={recipes}
            onSelectAlternative={handleSelectAlternative}
            onClose={() => setShowAlternatives(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AllergenChecker
export {
  AllergenWarningCard,
  AffectedChildrenModal,
  AlternativeSuggestionsModal,
  ALLERGEN_INFO,
  SEVERITY_COLORS
}
