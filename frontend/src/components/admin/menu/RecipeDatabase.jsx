import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './RecipeDatabase.css'

// Allergen Icons
const ALLERGEN_ICONS = {
  milk: { icon: '🥛', name: 'Sut' },
  eggs: { icon: '🥚', name: 'Tuxum' },
  nuts: { icon: '🥜', name: 'Yong\'oq' },
  gluten: { icon: '🌾', name: 'Gluten' },
  fish: { icon: '🐟', name: 'Baliq' },
  soy: { icon: '🫘', name: 'Soya' }
}

// Ingredient Categories
const INGREDIENT_CATEGORIES = [
  { id: 'vegetables', name: 'Sabzavotlar', icon: '🥬' },
  { id: 'fruits', name: 'Mevalar', icon: '🍎' },
  { id: 'meat', name: 'Go\'sht', icon: '🥩' },
  { id: 'dairy', name: 'Sut mahsulotlari', icon: '🧀' },
  { id: 'grains', name: 'Don mahsulotlari', icon: '🌾' },
  { id: 'spices', name: 'Ziravorlar', icon: '🧂' },
  { id: 'oils', name: 'Yog\'lar', icon: '🫒' },
  { id: 'other', name: 'Boshqa', icon: '📦' }
]

// Recipe Categories
const RECIPE_CATEGORIES = [
  { id: 'breakfast', name: 'Nonushta', icon: '🍳' },
  { id: 'soup', name: 'Sho\'rva', icon: '🍲' },
  { id: 'main', name: 'Asosiy taom', icon: '🍽️' },
  { id: 'side', name: 'Garnir', icon: '🥗' },
  { id: 'dessert', name: 'Desert', icon: '🍰' },
  { id: 'drink', name: 'Ichimlik', icon: '🥤' },
  { id: 'snack', name: 'Gazak', icon: '🍪' }
]

// Units
const UNITS = ['g', 'kg', 'ml', 'l', 'dona', 'osh qoshiq', 'choy qoshiq', 'stakan']

// Recipe Card Component
function RecipeCard({ recipe, onEdit, onDelete, onDuplicate }) {
  const [showDetails, setShowDetails] = useState(false)

  const categoryInfo = RECIPE_CATEGORIES.find(c => c.id === recipe.category)

  return (
    <motion.div
      className="recipe-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <div className="recipe-card-header">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.name} className="recipe-image" />
        ) : (
          <div className="recipe-image-placeholder">
            <span>{categoryInfo?.icon || '🍽️'}</span>
          </div>
        )}
        <div className="recipe-category-badge">
          {categoryInfo?.icon} {categoryInfo?.name}
        </div>
      </div>

      <div className="recipe-card-body">
        <h3 className="recipe-name">{recipe.name}</h3>
        {recipe.description && (
          <p className="recipe-description">{recipe.description}</p>
        )}

        <div className="recipe-stats">
          <div className="stat">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{recipe.calories || 0}</span>
            <span className="stat-label">kkal</span>
          </div>
          <div className="stat">
            <span className="stat-icon">⏱️</span>
            <span className="stat-value">{recipe.prepTime || 0}</span>
            <span className="stat-label">min</span>
          </div>
          <div className="stat">
            <span className="stat-icon">💰</span>
            <span className="stat-value">{(recipe.cost || 0).toLocaleString()}</span>
            <span className="stat-label">so'm</span>
          </div>
        </div>

        {recipe.allergens && recipe.allergens.length > 0 && (
          <div className="recipe-allergens">
            {recipe.allergens.map(allergen => (
              <span key={allergen} className="allergen-tag" title={ALLERGEN_ICONS[allergen]?.name}>
                {ALLERGEN_ICONS[allergen]?.icon || '⚠️'}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="recipe-card-actions">
        <button className="action-btn" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? '📖 Yopish' : '📖 Batafsil'}
        </button>
        <button className="action-btn" onClick={() => onDuplicate?.(recipe)}>
          📋
        </button>
        <button className="action-btn" onClick={() => onEdit?.(recipe)}>
          ✏️
        </button>
        <button className="action-btn delete" onClick={() => onDelete?.(recipe)}>
          🗑️
        </button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="recipe-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="details-section">
              <h4>📝 Ingredientlar</h4>
              <ul className="ingredients-list">
                {recipe.ingredients?.map((ing, idx) => (
                  <li key={idx}>
                    <span className="ing-name">{ing.name}</span>
                    <span className="ing-amount">{ing.amount} {ing.unit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {recipe.instructions && (
              <div className="details-section">
                <h4>👨‍🍳 Tayyorlash</h4>
                <ol className="instructions-list">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            <div className="details-section nutrition">
              <h4>📊 Ozuqaviy qiymati</h4>
              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <span className="label">Oqsil</span>
                  <span className="value">{recipe.protein || 0}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Uglevod</span>
                  <span className="value">{recipe.carbs || 0}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Yog'</span>
                  <span className="value">{recipe.fat || 0}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Tola</span>
                  <span className="value">{recipe.fiber || 0}g</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


// Ingredient Form Component
function IngredientForm({ ingredient, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: ingredient?.name || '',
    amount: ingredient?.amount || '',
    unit: ingredient?.unit || 'g',
    category: ingredient?.category || 'other'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.amount) {
      onSave(formData)
    }
  }

  return (
    <form className="ingredient-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ingredient nomi"
        value={formData.name}
        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
      />
      <input
        type="number"
        placeholder="Miqdor"
        value={formData.amount}
        onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
        required
        min="0"
        step="0.1"
      />
      <select
        value={formData.unit}
        onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
      >
        {UNITS.map(unit => (
          <option key={unit} value={unit}>{unit}</option>
        ))}
      </select>
      <select
        value={formData.category}
        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
      >
        {INGREDIENT_CATEGORIES.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
        ))}
      </select>
      <div className="ingredient-form-actions">
        <button type="submit" className="btn-save">✓</button>
        <button type="button" className="btn-cancel" onClick={onCancel}>✕</button>
      </div>
    </form>
  )
}

// Recipe Form Modal
function RecipeFormModal({ recipe, onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: recipe?.id || null,
    name: recipe?.name || '',
    description: recipe?.description || '',
    category: recipe?.category || 'main',
    image: recipe?.image || '',
    prepTime: recipe?.prepTime || '',
    cookTime: recipe?.cookTime || '',
    servings: recipe?.servings || 1,
    calories: recipe?.calories || '',
    protein: recipe?.protein || '',
    carbs: recipe?.carbs || '',
    fat: recipe?.fat || '',
    fiber: recipe?.fiber || '',
    cost: recipe?.cost || '',
    allergens: recipe?.allergens || [],
    ingredients: recipe?.ingredients || [],
    instructions: recipe?.instructions || ['']
  })

  const [showIngredientForm, setShowIngredientForm] = useState(false)
  const [editingIngredientIdx, setEditingIngredientIdx] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave?.({
      ...formData,
      id: formData.id || `recipe-${Date.now()}`,
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
      fiber: Number(formData.fiber) || 0,
      cost: Number(formData.cost) || 0,
      prepTime: Number(formData.prepTime) || 0,
      cookTime: Number(formData.cookTime) || 0
    })
  }

  const toggleAllergen = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }))
  }

  const addIngredient = (ingredient) => {
    if (editingIngredientIdx !== null) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.map((ing, idx) => 
          idx === editingIngredientIdx ? ingredient : ing
        )
      }))
      setEditingIngredientIdx(null)
    } else {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredient]
      }))
    }
    setShowIngredientForm(false)
  }

  const removeIngredient = (idx) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== idx)
    }))
  }

  const editIngredient = (idx) => {
    setEditingIngredientIdx(idx)
    setShowIngredientForm(true)
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const updateInstruction = (idx, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === idx ? value : inst)
    }))
  }

  const removeInstruction = (idx) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== idx)
    }))
  }

  // Auto-calculate nutrition from ingredients (simplified)
  const calculateNutrition = useCallback(() => {
    // This would normally fetch nutrition data from a database
    // For now, we'll just sum up what's entered
    const totalCalories = formData.ingredients.reduce((sum, ing) => {
      return sum + (ing.calories || 0)
    }, 0)
    
    if (totalCalories > 0) {
      setFormData(prev => ({ ...prev, calories: totalCalories }))
    }
  }, [formData.ingredients])

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="recipe-form-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{recipe ? '✏️ Retseptni tahrirlash' : '➕ Yangi retsept'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="recipe-form">
          <div className="form-tabs">
            <div className="form-section">
              <h3>📋 Asosiy ma'lumotlar</h3>
              
              <div className="form-group">
                <label>Retsept nomi *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Masalan: Osh, Manti, Lag'mon..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Qisqacha tavsif..."
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kategoriya</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {RECIPE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Porsiya soni</label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={e => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tayyorlash vaqti (min)</label>
                  <input
                    type="number"
                    value={formData.prepTime}
                    onChange={e => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Pishirish vaqti (min)</label>
                  <input
                    type="number"
                    value={formData.cookTime}
                    onChange={e => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Narxi (so'm)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={e => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rasm URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-section">
              <h3>🥗 Ingredientlar</h3>
              
              <div className="ingredients-list-edit">
                {formData.ingredients.map((ing, idx) => (
                  <div key={idx} className="ingredient-item">
                    <span className="ing-category">
                      {INGREDIENT_CATEGORIES.find(c => c.id === ing.category)?.icon || '📦'}
                    </span>
                    <span className="ing-name">{ing.name}</span>
                    <span className="ing-amount">{ing.amount} {ing.unit}</span>
                    <div className="ing-actions">
                      <button type="button" onClick={() => editIngredient(idx)}>✏️</button>
                      <button type="button" onClick={() => removeIngredient(idx)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              {showIngredientForm ? (
                <IngredientForm
                  ingredient={editingIngredientIdx !== null ? formData.ingredients[editingIngredientIdx] : null}
                  onSave={addIngredient}
                  onCancel={() => { setShowIngredientForm(false); setEditingIngredientIdx(null) }}
                />
              ) : (
                <button
                  type="button"
                  className="add-ingredient-btn"
                  onClick={() => setShowIngredientForm(true)}
                >
                  + Ingredient qo'shish
                </button>
              )}
            </div>

            <div className="form-section">
              <h3>📊 Ozuqaviy qiymati (1 porsiya)</h3>
              
              <div className="nutrition-form-grid">
                <div className="form-group">
                  <label>🔥 Kaloriya (kkal)</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={e => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>🥩 Oqsil (g)</label>
                  <input
                    type="number"
                    value={formData.protein}
                    onChange={e => setFormData(prev => ({ ...prev, protein: e.target.value }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>🍞 Uglevod (g)</label>
                  <input
                    type="number"
                    value={formData.carbs}
                    onChange={e => setFormData(prev => ({ ...prev, carbs: e.target.value }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>🧈 Yog' (g)</label>
                  <input
                    type="number"
                    value={formData.fat}
                    onChange={e => setFormData(prev => ({ ...prev, fat: e.target.value }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>🌾 Tola (g)</label>
                  <input
                    type="number"
                    value={formData.fiber}
                    onChange={e => setFormData(prev => ({ ...prev, fiber: e.target.value }))}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>⚠️ Allergenlar</h3>
              <div className="allergen-selector">
                {Object.entries(ALLERGEN_ICONS).map(([key, { icon, name }]) => (
                  <button
                    key={key}
                    type="button"
                    className={`allergen-btn ${formData.allergens.includes(key) ? 'active' : ''}`}
                    onClick={() => toggleAllergen(key)}
                  >
                    {icon} {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>👨‍🍳 Tayyorlash bosqichlari</h3>
              
              <div className="instructions-list-edit">
                {formData.instructions.map((instruction, idx) => (
                  <div key={idx} className="instruction-item">
                    <span className="step-number">{idx + 1}</span>
                    <textarea
                      value={instruction}
                      onChange={e => updateInstruction(idx, e.target.value)}
                      placeholder={`${idx + 1}-bosqich...`}
                      rows={2}
                    />
                    <button
                      type="button"
                      className="remove-step-btn"
                      onClick={() => removeInstruction(idx)}
                      disabled={formData.instructions.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="add-step-btn"
                onClick={addInstruction}
              >
                + Bosqich qo'shish
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" className="btn-primary">
              💾 Saqlash
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}


// Main Recipe Database Component
function RecipeDatabase({
  recipes = [],
  onSaveRecipe,
  onDeleteRecipe,
  onImportRecipes,
  onExportRecipes
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAllergen, setSelectedAllergen] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showRecipeForm, setShowRecipeForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid | list

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    let result = [...recipes]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(recipe =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.ingredients?.some(ing => ing.name.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(recipe => recipe.category === selectedCategory)
    }

    // Allergen filter (exclude recipes with selected allergen)
    if (selectedAllergen !== 'all') {
      result = result.filter(recipe => 
        !recipe.allergens?.includes(selectedAllergen)
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'calories':
          return (a.calories || 0) - (b.calories || 0)
        case 'cost':
          return (a.cost || 0) - (b.cost || 0)
        case 'prepTime':
          return (a.prepTime || 0) - (b.prepTime || 0)
        default:
          return 0
      }
    })

    return result
  }, [recipes, searchQuery, selectedCategory, selectedAllergen, sortBy])

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe)
    setShowRecipeForm(true)
  }

  const handleDuplicateRecipe = (recipe) => {
    const duplicated = {
      ...recipe,
      id: null,
      name: `${recipe.name} (nusxa)`
    }
    setEditingRecipe(duplicated)
    setShowRecipeForm(true)
  }

  const handleSaveRecipe = (recipeData) => {
    onSaveRecipe?.(recipeData)
    setShowRecipeForm(false)
    setEditingRecipe(null)
  }

  const handleDeleteRecipe = (recipe) => {
    if (window.confirm(`"${recipe.name}" retseptini o'chirmoqchimisiz?`)) {
      onDeleteRecipe?.(recipe.id)
    }
  }

  // Statistics
  const stats = useMemo(() => {
    return {
      total: recipes.length,
      byCategory: RECIPE_CATEGORIES.map(cat => ({
        ...cat,
        count: recipes.filter(r => r.category === cat.id).length
      })),
      avgCalories: recipes.length > 0 
        ? Math.round(recipes.reduce((sum, r) => sum + (r.calories || 0), 0) / recipes.length)
        : 0,
      avgCost: recipes.length > 0
        ? Math.round(recipes.reduce((sum, r) => sum + (r.cost || 0), 0) / recipes.length)
        : 0
    }
  }, [recipes])

  return (
    <div className="recipe-database">
      {/* Header */}
      <div className="recipe-db-header">
        <div className="header-title">
          <h2>📚 Retseptlar bazasi</h2>
          <span className="recipe-count">{filteredRecipes.length} ta retsept</span>
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={onImportRecipes}>
            📥 Import
          </button>
          <button className="action-btn" onClick={onExportRecipes}>
            📤 Export
          </button>
          <button 
            className="action-btn primary"
            onClick={() => { setEditingRecipe(null); setShowRecipeForm(true) }}
          >
            ➕ Yangi retsept
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="recipe-stats-bar">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Jami retsept</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.avgCalories}</span>
          <span className="stat-label">O'rtacha kkal</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.avgCost.toLocaleString()}</span>
          <span className="stat-label">O'rtacha narx</span>
        </div>
        <div className="category-pills">
          {stats.byCategory.filter(c => c.count > 0).map(cat => (
            <span key={cat.id} className="category-pill">
              {cat.icon} {cat.count}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="recipe-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Retsept qidirish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        <div className="filter-group">
          <label>Kategoriya:</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="all">Barchasi</option>
            {RECIPE_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Allergensiz:</label>
          <select
            value={selectedAllergen}
            onChange={e => setSelectedAllergen(e.target.value)}
          >
            <option value="all">Barchasi</option>
            {Object.entries(ALLERGEN_ICONS).map(([key, { icon, name }]) => (
              <option key={key} value={key}>{icon} {name}siz</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Saralash:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="name">Nomi bo'yicha</option>
            <option value="calories">Kaloriya bo'yicha</option>
            <option value="cost">Narxi bo'yicha</option>
            <option value="prepTime">Vaqti bo'yicha</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ▦
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Recipe Grid/List */}
      <div className={`recipe-container ${viewMode}`}>
        <AnimatePresence mode="popLayout">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={handleEditRecipe}
                onDelete={handleDeleteRecipe}
                onDuplicate={handleDuplicateRecipe}
              />
            ))
          ) : (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="empty-icon">📋</span>
              <h3>Retsept topilmadi</h3>
              <p>
                {searchQuery || selectedCategory !== 'all' || selectedAllergen !== 'all'
                  ? 'Filtrlarni o\'zgartiring yoki yangi retsept qo\'shing'
                  : 'Birinchi retseptingizni qo\'shing'}
              </p>
              <button
                className="btn-primary"
                onClick={() => { setEditingRecipe(null); setShowRecipeForm(true) }}
              >
                ➕ Retsept qo'shish
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recipe Form Modal */}
      <AnimatePresence>
        {showRecipeForm && (
          <RecipeFormModal
            recipe={editingRecipe}
            onSave={handleSaveRecipe}
            onClose={() => { setShowRecipeForm(false); setEditingRecipe(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default RecipeDatabase
export {
  RecipeCard,
  RecipeFormModal,
  IngredientForm,
  ALLERGEN_ICONS,
  INGREDIENT_CATEGORIES,
  RECIPE_CATEGORIES,
  UNITS
}
