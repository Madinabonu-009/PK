import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ProDataGrid.css'

// Sort icons
const SortIcon = ({ direction }) => (
  <span className="sort-icon">
    {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
  </span>
)

// Filter Input Component
function FilterInput({ column, value, onChange }) {
  const [localValue, setLocalValue] = useState(value || '')

  const handleChange = (e) => {
    setLocalValue(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onChange(column.id, localValue)
    }
  }

  const handleBlur = () => {
    onChange(column.id, localValue)
  }

  return (
    <input
      type="text"
      className="grid-filter-input"
      placeholder={`${column.header}...`}
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  )
}

// Checkbox Component
function Checkbox({ checked, indeterminate, onChange, disabled }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <input
      ref={ref}
      type="checkbox"
      className="grid-checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
  )
}

// Skeleton Row
function SkeletonRow({ columns }) {
  return (
    <tr className="grid-row grid-row--skeleton">
      {columns.map((col, i) => (
        <td key={i} className="grid-cell">
          <div className="skeleton-cell" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  )
}

// Empty State
function EmptyState({ message = "Ma'lumot topilmadi", icon = '📭' }) {
  return (
    <div className="grid-empty">
      <span className="grid-empty-icon">{icon}</span>
      <p className="grid-empty-text">{message}</p>
    </div>
  )
}

// Pagination Component
function Pagination({ page, totalPages, pageSize, total, onPageChange, onPageSizeChange }) {
  const pageSizes = [10, 25, 50, 100]

  return (
    <div className="grid-pagination">
      <div className="pagination-info">
        <span>Jami: {total} ta</span>
        <select 
          className="pagination-size-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizes.map(size => (
            <option key={size} value={size}>{size} ta</option>
          ))}
        </select>
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          ««
        </button>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          «
        </button>
        
        <span className="pagination-current">
          {page} / {totalPages}
        </span>

        <button
          className="pagination-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          »
        </button>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          »»
        </button>
      </div>
    </div>
  )
}

// Bulk Actions Toolbar
function BulkActionsToolbar({ selectedCount, actions, onClearSelection }) {
  if (selectedCount === 0) return null

  return (
    <motion.div
      className="bulk-actions-toolbar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <span className="bulk-selected-count">
        {selectedCount} ta tanlangan
      </span>
      <div className="bulk-actions">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`bulk-action-btn ${action.variant || ''}`}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon && <span className="bulk-action-icon">{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
      <button className="bulk-clear-btn" onClick={onClearSelection}>
        Bekor qilish
      </button>
    </motion.div>
  )
}

// Main ProDataGrid Component
function ProDataGrid({
  data = [],
  columns = [],
  loading = false,
  // Pagination
  pagination = true,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
  onPageSizeChange,
  // Sorting
  sortable = true,
  sortColumn,
  sortDirection,
  onSort,
  // Filtering
  filterable = true,
  filters = {},
  onFilterChange,
  // Selection
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  // Row actions
  onRowClick,
  rowActions,
  // Bulk actions
  bulkActions = [],
  // Styling
  striped = true,
  hoverable = true,
  compact = false,
  stickyHeader = true,
  // Empty state
  emptyMessage,
  emptyIcon,
  // Virtual scroll
  virtualScroll = false,
  rowHeight = 52
}) {
  const [showFilters, setShowFilters] = useState(false)
  const tableRef = useRef(null)

  // Calculate total pages
  const totalItems = total || data.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Handle sort
  const handleSort = useCallback((columnId) => {
    if (!sortable || !onSort) return
    
    const column = columns.find(c => c.id === columnId)
    if (!column?.sortable) return

    let newDirection = 'asc'
    if (sortColumn === columnId) {
      newDirection = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc'
    }
    onSort(columnId, newDirection)
  }, [sortable, sortColumn, sortDirection, columns, onSort])

  // Handle selection
  const handleSelectAll = useCallback((e) => {
    if (!onSelectionChange) return
    if (e.target.checked) {
      onSelectionChange(data.map(row => row.id))
    } else {
      onSelectionChange([])
    }
  }, [data, onSelectionChange])

  const handleSelectRow = useCallback((rowId) => {
    if (!onSelectionChange) return
    const newSelection = selectedRows.includes(rowId)
      ? selectedRows.filter(id => id !== rowId)
      : [...selectedRows, rowId]
    onSelectionChange(newSelection)
  }, [selectedRows, onSelectionChange])

  // Check selection state
  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length

  // Get cell value
  const getCellValue = (row, column) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row)
    }
    return row[column.accessor || column.id]
  }

  // Render cell
  const renderCell = (row, column) => {
    const value = getCellValue(row, column)
    if (column.render) {
      return column.render(value, row)
    }
    return value
  }

  return (
    <div className={`pro-data-grid ${compact ? 'pro-data-grid--compact' : ''}`}>
      {/* Toolbar */}
      <div className="grid-toolbar">
        <div className="grid-toolbar-left">
          {filterable && (
            <button
              className={`grid-filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              🔍 Filter
            </button>
          )}
        </div>
        <div className="grid-toolbar-right">
          {/* Additional toolbar items can go here */}
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectable && selectedRows.length > 0 && (
          <BulkActionsToolbar
            selectedCount={selectedRows.length}
            actions={bulkActions}
            onClearSelection={() => onSelectionChange([])}
          />
        )}
      </AnimatePresence>

      {/* Table Container */}
      <div className={`grid-container ${stickyHeader ? 'sticky-header' : ''}`} ref={tableRef}>
        <table className={`grid-table ${striped ? 'striped' : ''} ${hoverable ? 'hoverable' : ''}`}>
          <thead className="grid-header">
            {/* Filter Row */}
            {showFilters && filterable && (
              <tr className="grid-filter-row">
                {selectable && <th className="grid-cell grid-cell--checkbox" />}
                {columns.map((column) => (
                  <th key={column.id} className="grid-cell grid-cell--filter">
                    {column.filterable !== false && (
                      <FilterInput
                        column={column}
                        value={filters[column.id]}
                        onChange={onFilterChange}
                      />
                    )}
                  </th>
                ))}
                {rowActions && <th className="grid-cell grid-cell--actions" />}
              </tr>
            )}

            {/* Header Row */}
            <tr className="grid-header-row">
              {selectable && (
                <th className="grid-cell grid-cell--checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`grid-cell grid-cell--header ${column.sortable !== false && sortable ? 'sortable' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.id)}
                >
                  <div className="grid-header-content">
                    <span className="grid-header-text">{column.header}</span>
                    {column.sortable !== false && sortable && (
                      <SortIcon direction={sortColumn === column.id ? sortDirection : null} />
                    )}
                  </div>
                </th>
              ))}
              {rowActions && (
                <th className="grid-cell grid-cell--actions grid-cell--header">
                  Amallar
                </th>
              )}
            </tr>
          </thead>

          <tbody className="grid-body">
            {loading ? (
              // Skeleton rows
              [...Array(pageSize)].map((_, i) => (
                <SkeletonRow key={i} columns={columns} />
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}>
                  <EmptyState message={emptyMessage} icon={emptyIcon} />
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((row, rowIndex) => (
                <motion.tr
                  key={row.id || rowIndex}
                  className={`grid-row ${selectedRows.includes(row.id) ? 'selected' : ''}`}
                  onClick={() => onRowClick?.(row)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.02 }}
                >
                  {selectable && (
                    <td className="grid-cell grid-cell--checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`grid-cell ${column.className || ''}`}
                      style={{ width: column.width }}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="grid-cell grid-cell--actions" onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        {rowActions(row)}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          total={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}

export default ProDataGrid
export { Pagination, BulkActionsToolbar, EmptyState }
