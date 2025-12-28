import { useState, useMemo, useCallback } from 'react'

/**
 * Pagination hook - ro'yxatlarni sahifalash uchun
 * @param {Object} options - sozlamalar
 * @param {Array} options.data - to'liq ma'lumotlar ro'yxati
 * @param {number} options.itemsPerPage - har sahifadagi elementlar soni
 * @param {number} options.initialPage - boshlang'ich sahifa
 * @returns {Object} - pagination ma'lumotlari va funksiyalari
 */
export function usePagination({ 
  data = [], 
  itemsPerPage = 10, 
  initialPage = 1 
}) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Joriy sahifadagi elementlar
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  // Sahifa o'zgartirish
  const goToPage = useCallback((page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const firstPage = useCallback(() => {
    goToPage(1)
  }, [goToPage])

  const lastPage = useCallback(() => {
    goToPage(totalPages)
  }, [goToPage, totalPages])

  // Sahifa raqamini reset qilish (filter o'zgarganda)
  const resetPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  // Ma'lumotlar o'zgarganda sahifani tekshirish
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return {
    // Ma'lumotlar
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    
    // Holatlar
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    
    // Funksiyalar
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    resetPage,
    setCurrentPage
  }
}

/**
 * Server-side pagination hook
 * API dan ma'lumot olish uchun
 */
export function useServerPagination({
  initialPage = 1,
  initialItemsPerPage = 10,
  onPageChange
}) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [totalItems, setTotalItems] = useState(0)

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const goToPage = useCallback((page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages || 1))
    setCurrentPage(pageNumber)
    onPageChange?.({ page: pageNumber, limit: itemsPerPage })
  }, [totalPages, itemsPerPage, onPageChange])

  const changeItemsPerPage = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
    onPageChange?.({ page: 1, limit: newItemsPerPage })
  }, [onPageChange])

  const updateTotalItems = useCallback((total) => {
    setTotalItems(total)
  }, [])

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
    changeItemsPerPage,
    updateTotalItems
  }
}

export default usePagination
