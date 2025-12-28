/**
 * Site Configuration
 * Sayt statistikalari va sozlamalari
 * Default qiymatlar - API dan kelgan ma'lumotlar bilan yangilanadi
 */

// Default config - API dan kelguncha ishlatiladi
export const defaultSiteConfig = {
  name: 'Play Kids',
  
  stats: {
    happyChildren: 150,
    experiencedTeachers: 10,
    yearsExperience: 5
  },
  
  contact: {
    phone: '+998 94 514 09 49',
    email: 'info@playkids.uz',
    address: "Buxoro viloyati, G'ijduvon tumani"
  },
  
  social: {
    telegram: 'https://t.me/playkids',
    instagram: 'https://instagram.com/playkids',
    facebook: 'https://facebook.com/playkids'
  },
  
  workingHours: {
    weekdays: '07:00 - 19:00',
    saturday: '08:00 - 14:00',
    sunday: 'Dam olish kuni'
  }
}

// Reactive config - API dan yangilanadi
let siteConfig = { ...defaultSiteConfig }

// Config ni yangilash funksiyasi
export const updateSiteConfig = (newConfig) => {
  if (newConfig) {
    siteConfig = {
      ...siteConfig,
      ...newConfig,
      stats: { ...siteConfig.stats, ...newConfig.stats },
      contact: { ...siteConfig.contact, ...newConfig.contact },
      social: { ...siteConfig.social, ...newConfig.social },
      workingHours: { ...siteConfig.workingHours, ...newConfig.workingHours }
    }
  }
  return siteConfig
}

// Config ni olish
export const getSiteConfig = () => siteConfig

// API dan config yuklash
export const loadSiteConfig = async (api) => {
  try {
    // Settings dan yuklash
    const response = await api.get('/settings/public')
    const settings = response.data?.general || response.data || {}
    
    // Children va teachers sonini olish
    const [childrenRes, teachersRes] = await Promise.all([
      api.get('/children').catch(() => ({ data: [] })),
      api.get('/teachers').catch(() => ({ data: [] }))
    ])
    
    const children = childrenRes.data?.data || childrenRes.data || []
    const teachers = teachersRes.data?.data || teachersRes.data || []
    
    const newConfig = {
      name: settings.siteName || defaultSiteConfig.name,
      stats: {
        happyChildren: Array.isArray(children) ? children.filter(c => c.isActive !== false).length : defaultSiteConfig.stats.happyChildren,
        experiencedTeachers: Array.isArray(teachers) ? teachers.length : defaultSiteConfig.stats.experiencedTeachers,
        yearsExperience: settings.yearsExperience || defaultSiteConfig.stats.yearsExperience
      },
      contact: {
        phone: settings.contactPhone || defaultSiteConfig.contact.phone,
        email: settings.contactEmail || defaultSiteConfig.contact.email,
        address: settings.address || defaultSiteConfig.contact.address
      },
      workingHours: {
        weekdays: settings.workingHours?.weekdays || defaultSiteConfig.workingHours.weekdays,
        saturday: settings.workingHours?.saturday || defaultSiteConfig.workingHours.saturday,
        sunday: settings.workingHours?.sunday || defaultSiteConfig.workingHours.sunday
      }
    }
    
    return updateSiteConfig(newConfig)
  } catch (error) {
    console.warn('Failed to load site config from API, using defaults')
    return siteConfig
  }
}

export { siteConfig }
export default siteConfig
