import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// JSON file-based settings storage (works without database)
const SETTINGS_FILE = path.join(__dirname, '../../data/settings.json')

// Ensure data directory exists
const dataDir = path.dirname(SETTINGS_FILE)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize settings file if not exists
if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify({}, null, 2))
}

class Settings {
  static readFile() {
    try {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
      return JSON.parse(data)
    } catch {
      return {}
    }
  }

  static writeFile(data) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2))
  }

  static async get(key) {
    const settings = this.readFile()
    return settings[key] ?? null
  }

  static async set(key, value) {
    const settings = this.readFile()
    settings[key] = value
    this.writeFile(settings)
    return { key, value }
  }

  static async getAll() {
    return this.readFile()
  }

  static async setMultiple(settingsObj) {
    const settings = this.readFile()
    for (const [key, value] of Object.entries(settingsObj)) {
      settings[key] = value
    }
    this.writeFile(settings)
    return settingsObj
  }

  static async delete(key) {
    const settings = this.readFile()
    delete settings[key]
    this.writeFile(settings)
    return true
  }
}

export default Settings