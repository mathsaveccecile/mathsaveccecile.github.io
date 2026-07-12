import { PDFDocument } from 'pdf-lib'
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, basename, extname } from 'path'
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  copyFileSync
} from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

app.disableHardwareAcceleration()

// ======================================================
// CHEMINS PRINCIPAUX
// ======================================================

const SITE_FOLDER =
  'C:/Users/tetil/Documents/GitHub/mathsaveccecile.github.io'

const ADMIN_FOLDER = `${SITE_FOLDER}/maths-avec-cecile-admin`
const PROJECTS_FOLDER = `${ADMIN_FOLDER}/capsules`

const CAPSULES_FILE = `${SITE_FOLDER}/capsules.json`
const SITEMAP_FILE = `${SITE_FOLDER}/sitemap.xml`

const THUMBNAILS_FOLDER = `${SITE_FOLDER}/assets/thumbnails`
const QUIZ_IMAGES_FOLDER = `${SITE_FOLDER}/assets/quiz`
const IMAGES_FOLDER = `${SITE_FOLDER}/assets/images`

const SITE_URL = 'https://mathsaveccecile.github.io'

// ======================================================
// FONCTIONS UTILITAIRES
// ======================================================

function ensureFolder(folder) {
  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true })
  }
}

function ensureAllFolders() {
  ensureFolder(PROJECTS_FOLDER)
  ensureFolder(THUMBNAILS_FOLDER)
  ensureFolder(QUIZ_IMAGES_FOLDER)
  ensureFolder(IMAGES_FOLDER)
}

function createSlug(title = 'capsule') {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createSafeProjectName(title = 'capsule') {
  return title
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/[. ]+$/g, '')
}

function getFileExtension(filePath, defaultExtension = 'png') {
  const extension = extname(filePath).replace('.', '').toLowerCase()
  return extension || defaultExtension
}

function readCapsulesFile() {
  if (!existsSync(CAPSULES_FILE)) {
    return []
  }

  try {
    const content = readFileSync(CAPSULES_FILE, 'utf8')
    const capsules = JSON.parse(content)

    return Array.isArray(capsules) ? capsules : []
  } catch (error) {
    console.error('Impossible de lire capsules.json :', error)
    throw new Error(
      'Le fichier capsules.json contient probablement une erreur de syntaxe.'
    )
  }
}

function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateSitemap(capsules) {
  const today = getTodayDate()

  const fixedPages = [
    {
      url: `${SITE_URL}/`,
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      url: `${SITE_URL}/6e.html`,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: `${SITE_URL}/5e.html`,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: `${SITE_URL}/4e.html`,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: `${SITE_URL}/3e.html`,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: `${SITE_URL}/quisuisje.html`,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${SITE_URL}/avis.html`,
      changefreq: 'weekly',
      priority: '0.8'
    }
  ]

  const capsulePages = Array.from(
    new Set(
      (Array.isArray(capsules) ? capsules : [])
        .map((capsule) =>
          capsule && typeof capsule.page === 'string'
            ? capsule.page.trim()
            : ''
        )
        .filter(Boolean)
        .filter((page) => page !== 'index.html')
    )
  )
    .sort((a, b) =>
      a.localeCompare(b, 'fr', {
        sensitivity: 'base'
      })
    )
    .map((page) => ({
      url: `${SITE_URL}/${page}`,
      changefreq: 'monthly',
      priority: '0.9'
    }))

  const allPages = [...fixedPages, ...capsulePages]

  const urlsXml = allPages
    .map(
      (page) => `  <url>
    <loc>${escapeXml(page.url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('\n\n')

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urlsXml}

</urlset>
`

  writeFileSync(
    SITEMAP_FILE,
    sitemapContent,
    'utf8'
  )

  console.log(
    `Sitemap généré automatiquement : ${allPages.length} URL(s)`
  )
}

function saveProject(data) {
  ensureFolder(PROJECTS_FOLDER)

  const projectFileName = createSafeProjectName(data.title)

  writeFileSync(
    `${PROJECTS_FOLDER}/${projectFileName}.json`,
    JSON.stringify(data, null, 2),
    'utf8'
  )

  return projectFileName
}

function writeBase64Image(dataUrl, destinationPath) {
  const commaIndex = dataUrl.indexOf(',')

  if (commaIndex === -1) {
    throw new Error('Image encodée incorrectement.')
  }

  const base64 = dataUrl.slice(commaIndex + 1)

  writeFileSync(destinationPath, Buffer.from(base64, 'base64'))
}

function prepareQuizImage(step, index, slug) {
  const defaultFileName = `${slug}-quiz-${index + 1}.png`

  if (step.imagePath && existsSync(step.imagePath)) {
    const extension = getFileExtension(step.imagePath)
    const finalName = `${slug}-quiz-${index + 1}.${extension}`

    copyFileSync(
      step.imagePath,
      `${QUIZ_IMAGES_FOLDER}/${finalName}`
    )

    step.image = `assets/quiz/${finalName}`
  } else if (
    typeof step.image === 'string' &&
    step.image.startsWith('data:image')
  ) {
    writeBase64Image(
      step.image,
      `${QUIZ_IMAGES_FOLDER}/${defaultFileName}`
    )

    step.image = `assets/quiz/${defaultFileName}`
  }

  delete step.imagePath
  delete step.imageName

  return step
}

function prepareSimpleImage(step, index, slug) {
  const defaultFileName = `${slug}-image-${index + 1}.jpg`

  if (step.path && existsSync(step.path)) {
    const extension = getFileExtension(step.path, 'jpg')
    const finalName = `${slug}-image-${index + 1}.${extension}`

    copyFileSync(
      step.path,
      `${IMAGES_FOLDER}/${finalName}`
    )

    step.src = `assets/images/${finalName}`
  } else if (
    typeof step.src === 'string' &&
    step.src.startsWith('data:image')
  ) {
    writeBase64Image(
      step.src,
      `${IMAGES_FOLDER}/${defaultFileName}`
    )

    step.src = `assets/images/${defaultFileName}`
  }

  delete step.path

  return step
}

function prepareSteps(steps, slug) {
  if (!Array.isArray(steps)) {
    return []
  }

  return steps.map((step, index) => {
    if (step.type === 'quiz') {
      return prepareQuizImage(step, index, slug)
    }

    if (step.type === 'image') {
      return prepareSimpleImage(step, index, slug)
    }

    return step
  })
}

// ======================================================
// FENÊTRE PRINCIPALE
// ======================================================

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ======================================================
// DÉMARRAGE DE L’APPLICATION
// ======================================================

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  ensureAllFolders()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => {
    console.log('pong')
  })

  // ====================================================
  // CHOISIR UNE IMAGE
  // ====================================================

  ipcMain.handle('choose-image', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Choisir une image',
      properties: ['openFile'],
      filters: [
        {
          name: 'Images',
          extensions: ['jpg', 'jpeg', 'png', 'webp']
        }
      ]
    })

    if (result.canceled) {
      return null
    }

    const filePath = result.filePaths[0]
    const extension = getFileExtension(filePath, 'jpg')

    let mime = 'image/jpeg'

    if (extension === 'png') {
      mime = 'image/png'
    } else if (extension === 'webp') {
      mime = 'image/webp'
    }

    const base64 = readFileSync(filePath).toString('base64')

    return {
      name: basename(filePath),
      path: filePath,
      src: `data:${mime};base64,${base64}`
    }
  })

  // ====================================================
  // CHOISIR UNE VIDÉO
  // ====================================================

  ipcMain.handle('choose-video', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Choisir une vidéo',
      properties: ['openFile'],
      filters: [
        {
          name: 'Vidéos',
          extensions: ['mp4', 'mov', 'webm']
        }
      ]
    })

    if (result.canceled) {
      return null
    }

    const filePath = result.filePaths[0]

    return {
      name: basename(filePath),
      path: filePath
    }
  })

  // ====================================================
  // CHOISIR UN PDF
  // ====================================================

  ipcMain.handle('choose-pdf', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Choisir un PDF',
      properties: ['openFile'],
      filters: [
        {
          name: 'PDF',
          extensions: ['pdf']
        }
      ]
    })

    if (result.canceled) {
      return null
    }

    const filePath = result.filePaths[0]
    const pdfBuffer = readFileSync(filePath)

    let pages = 1

    try {
      const pdfDocument = await PDFDocument.load(pdfBuffer)
      pages = pdfDocument.getPageCount()
    } catch (error) {
      console.error(
        'Impossible de compter les pages du PDF :',
        error
      )
    }

    console.log('Nombre de pages détecté :', pages)

    return {
      name: basename(filePath),
      path: filePath,
      src: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
      pages
    }
  })

  // ====================================================
  // OUVRIR MANUELLEMENT UN PROJET
  // ====================================================

  ipcMain.handle('open-capsule', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Ouvrir une capsule',
      properties: ['openFile'],
      filters: [
        {
          name: 'Capsules',
          extensions: ['json']
        }
      ]
    })

    if (result.canceled) {
      return null
    }

    const filePath = result.filePaths[0]

    return readFileSync(filePath, 'utf8')
  })

  // ====================================================
  // EXPORTER UNE CAPSULE SUR LE SITE
  // ====================================================

  ipcMain.handle('export-site', async (_, data) => {
    try {
      ensureAllFolders()

      if (!data || !data.title || !data.title.trim()) {
        throw new Error(
          'Le nom de la capsule est obligatoire avant l’export.'
        )
      }

      const capsules = readCapsulesFile()
      const slug = createSlug(data.title)

      if (!slug) {
        throw new Error(
          'Impossible de créer un nom de fichier valide pour cette capsule.'
        )
      }

      const pageName = `${slug}.html`
      const dataFileName = `${slug}-data.js`

      let thumbnailPath = data.thumbnail || ''

      if (
        data.thumbnailPath &&
        existsSync(data.thumbnailPath)
      ) {
        const extension = getFileExtension(
          data.thumbnailPath,
          'png'
        )

        const thumbnailFileName = `${slug}.${extension}`

        copyFileSync(
          data.thumbnailPath,
          `${THUMBNAILS_FOLDER}/${thumbnailFileName}`
        )

        thumbnailPath =
          `assets/thumbnails/${thumbnailFileName}`
      }

      const cleanData = JSON.parse(
        JSON.stringify(data)
      )

      cleanData.steps = prepareSteps(
        cleanData.steps,
        slug
      )

      cleanData.thumbnail = thumbnailPath
      cleanData.thumbnailPath = ''

      const capsuleInfo = {
        title: data.title,
        levels: Array.isArray(data.levels)
          ? data.levels
          : [],
        duration: data.duration || '',
        thumbnail: thumbnailPath,
        page: pageName,
        dataFile: dataFileName
      }

      if (
        Array.isArray(data.keywords) &&
        data.keywords.length > 0
      ) {
        capsuleInfo.keywords = data.keywords
      }

      const existingIndex = capsules.findIndex(
        (capsule) =>
          capsule.dataFile === capsuleInfo.dataFile ||
          capsule.page === capsuleInfo.page
      )

      if (existingIndex >= 0) {
        capsules[existingIndex] = {
          ...capsules[existingIndex],
          ...capsuleInfo
        }
      } else {
        capsules.push(capsuleInfo)
      }

      writeFileSync(
        CAPSULES_FILE,
        JSON.stringify(capsules, null, 2),
        'utf8'
      )
generateSitemap(capsules)
      const output =
        `const capsuleData = ${JSON.stringify(cleanData, null, 2)};`

      writeFileSync(
        `${SITE_FOLDER}/${dataFileName}`,
        output,
        'utf8'
      )

      // L’export enregistre aussi automatiquement
      // le projet dans l’Admin.
      const projectFileName = saveProject(data)

      console.log('Capsule exportée :', data.title)
      console.log('Niveaux :', data.levels)
      console.log('Vignette :', thumbnailPath)
      console.log(
        'Projet enregistré :',
        `${projectFileName}.json`
      )

      return true
    } catch (error) {
      console.error(
        'Erreur pendant l’export de la capsule :',
        error
      )

      throw error
    }
  })

  // ====================================================
  // ENREGISTRER UN PROJET DANS L’ADMIN
  // ====================================================

  ipcMain.handle('save-project', async (_, data) => {
    try {
      if (!data || !data.title || !data.title.trim()) {
        throw new Error(
          'Le nom de la capsule est obligatoire avant l’enregistrement.'
        )
      }

      saveProject(data)

      return true
    } catch (error) {
      console.error(
        'Erreur pendant l’enregistrement du projet :',
        error
      )

      throw error
    }
  })

  // ====================================================
  // LISTER LES CAPSULES ENREGISTRÉES
  // ====================================================

  ipcMain.handle('list-capsules', async () => {
    ensureFolder(PROJECTS_FOLDER)

    return readdirSync(PROJECTS_FOLDER)
      .filter((file) => file.endsWith('.json'))
      .sort((a, b) =>
        a.localeCompare(b, 'fr', {
          sensitivity: 'base'
        })
      )
  })

  // ====================================================
  // OUVRIR UNE CAPSULE DEPUIS LA LISTE DE L’ADMIN
  // ====================================================

  ipcMain.handle(
    'open-project',
    async (_, filename) => {
      const filePath =
        `${PROJECTS_FOLDER}/${filename}`

      if (!existsSync(filePath)) {
        throw new Error(
          `Le projet "${filename}" est introuvable.`
        )
      }

      return readFileSync(filePath, 'utf8')
    }
  )

  createWindow()

  app.on('activate', () => {
    if (
      BrowserWindow.getAllWindows().length === 0
    ) {
      createWindow()
    }
  })
})

// ======================================================
// FERMETURE DE L’APPLICATION
// ======================================================

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})