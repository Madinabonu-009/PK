// Markazlashtirilgan tarjimalar - barcha sahifalar uchun
export const commonTexts = {
  uz: {
    // Umumiy
    loading: 'Yuklanmoqda...',
    error: 'Xatolik yuz berdi',
    retry: 'Qayta urinish',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    delete: 'O\'chirish',
    edit: 'Tahrirlash',
    add: 'Qo\'shish',
    close: 'Yopish',
    back: 'Orqaga',
    next: 'Keyingi',
    prev: 'Oldingi',
    search: 'Qidirish',
    filter: 'Filtrlash',
    all: 'Barchasi',
    noData: 'Ma\'lumot yo\'q',
    noResults: 'Natija topilmadi',
    confirm: 'Tasdiqlash',
    yes: 'Ha',
    no: 'Yo\'q',
    
    // Vaqt
    today: 'Bugun',
    yesterday: 'Kecha',
    tomorrow: 'Ertaga',
    days: 'kun',
    hours: 'soat',
    minutes: 'daqiqa',
    
    // Pul
    currency: 'so\'m',
    monthlyFee: 'Oylik to\'lov',
    monthlyFeeAmount: '500,000 so\'m',
    
    // Holatlar
    pending: 'Kutilmoqda',
    approved: 'Tasdiqlangan',
    rejected: 'Rad etilgan',
    paid: 'To\'langan',
    unpaid: 'To\'lanmagan',
    active: 'Faol',
    inactive: 'Nofaol',
    
    // Xabarlar
    savedSuccess: 'Muvaffaqiyatli saqlandi',
    deletedSuccess: 'Muvaffaqiyatli o\'chirildi',
    errorOccurred: 'Xatolik yuz berdi. Qayta urinib ko\'ring.',
    networkError: 'Internet aloqasi yo\'q. Iltimos, ulanishni tekshiring.',
    sessionExpired: 'Sessiya tugadi. Qayta kiring.',
    
    // Form
    required: 'Majburiy maydon',
    invalidEmail: 'Email noto\'g\'ri',
    invalidPhone: 'Telefon raqam noto\'g\'ri',
    minLength: 'Kamida {min} ta belgi bo\'lishi kerak',
    maxLength: 'Ko\'pi bilan {max} ta belgi bo\'lishi mumkin',
    
    // Empty states
    emptyList: 'Ro\'yxat bo\'sh',
    emptyGallery: 'Galereya bo\'sh',
    emptyCalendar: 'Tadbirlar yo\'q',
    addFirst: 'Birinchisini qo\'shing'
  },
  ru: {
    loading: 'Загрузка...',
    error: 'Произошла ошибка',
    retry: 'Повторить',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    add: 'Добавить',
    close: 'Закрыть',
    back: 'Назад',
    next: 'Далее',
    prev: 'Назад',
    search: 'Поиск',
    filter: 'Фильтр',
    all: 'Все',
    noData: 'Нет данных',
    noResults: 'Результаты не найдены',
    confirm: 'Подтвердить',
    yes: 'Да',
    no: 'Нет',
    
    today: 'Сегодня',
    yesterday: 'Вчера',
    tomorrow: 'Завтра',
    days: 'дней',
    hours: 'часов',
    minutes: 'минут',
    
    currency: 'сум',
    monthlyFee: 'Ежемесячная оплата',
    monthlyFeeAmount: '500 000 сум',
    
    pending: 'Ожидает',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    active: 'Активный',
    inactive: 'Неактивный',
    
    savedSuccess: 'Успешно сохранено',
    deletedSuccess: 'Успешно удалено',
    errorOccurred: 'Произошла ошибка. Попробуйте снова.',
    networkError: 'Нет подключения к интернету. Проверьте соединение.',
    sessionExpired: 'Сессия истекла. Войдите снова.',
    
    required: 'Обязательное поле',
    invalidEmail: 'Неверный email',
    invalidPhone: 'Неверный номер телефона',
    minLength: 'Минимум {min} символов',
    maxLength: 'Максимум {max} символов',
    
    emptyList: 'Список пуст',
    emptyGallery: 'Галерея пуста',
    emptyCalendar: 'Нет мероприятий',
    addFirst: 'Добавьте первый'
  },
  en: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Try again',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    prev: 'Previous',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    noData: 'No data',
    noResults: 'No results found',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    
    currency: 'sum',
    monthlyFee: 'Monthly fee',
    monthlyFeeAmount: '500,000 sum',
    
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    paid: 'Paid',
    unpaid: 'Unpaid',
    active: 'Active',
    inactive: 'Inactive',
    
    savedSuccess: 'Successfully saved',
    deletedSuccess: 'Successfully deleted',
    errorOccurred: 'An error occurred. Please try again.',
    networkError: 'No internet connection. Please check your connection.',
    sessionExpired: 'Session expired. Please log in again.',
    
    required: 'Required field',
    invalidEmail: 'Invalid email',
    invalidPhone: 'Invalid phone number',
    minLength: 'Minimum {min} characters',
    maxLength: 'Maximum {max} characters',
    
    emptyList: 'List is empty',
    emptyGallery: 'Gallery is empty',
    emptyCalendar: 'No events',
    addFirst: 'Add the first one'
  }
}

export const getCommonText = (language, key, params = {}) => {
  let text = commonTexts[language]?.[key] || commonTexts.uz[key] || key
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param])
  })
  return text
}
