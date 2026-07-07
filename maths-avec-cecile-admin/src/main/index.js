import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, basename } from 'path'
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
app.disableHardwareAcceleration()


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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('choose-image', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Choisir une image',
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }
      ]
    })

    if (result.canceled) return null

    const filePath = result.filePaths[0]
    const ext = filePath.split('.').pop().toLowerCase()
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
    const data = readFileSync(filePath).toString('base64')

    return {
      name: basename(filePath),
      path: filePath,
      src: `data:${mime};base64,${data}`
    }
  })

  ipcMain.handle('choose-video', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Choisir une vidéo',
      properties: ['openFile'],
      filters: [
        { name: 'Vidéos', extensions: ['mp4', 'mov', 'webm'] }
      ]
    })

    if (result.canceled) return null

    const filePath = result.filePaths[0]

    return {
      name: basename(filePath),
      path: filePath
    }
  })

  ipcMain.handle('choose-pdf', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Choisir un PDF',
      properties: ['openFile'],
      filters: [
        { name: 'PDF', extensions: ['pdf'] }
      ]
    })

    if (result.canceled) return null

    const filePath = result.filePaths[0]
    const data = readFileSync(filePath).toString('base64')

    return {
      name: basename(filePath),
      path: filePath,
      src: `data:application/pdf;base64,${data}`
    }
  })

  ipcMain.handle('open-capsule', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Ouvrir une capsule',
      properties: ['openFile'],
      filters: [
        { name: 'Capsules', extensions: ['json'] }
      ]
    })

    if (result.canceled) return null

    const filePath = result.filePaths[0]
    const json = readFileSync(filePath, 'utf8')

    return json
  })

 ipcMain.handle('export-site', async (_, data) => {
  const siteFolder = 'C:/Users/tetil/Documents/GitHub/mathsaveccecile.github.io'
  const capsulesFile = `${siteFolder}/capsules.json`
  const thumbnailsFolder = `${siteFolder}/assets/thumbnails`

  if (!existsSync(thumbnailsFolder)) {
    mkdirSync(thumbnailsFolder, { recursive: true })
  }

  let capsules = []

  if (existsSync(capsulesFile)) {
    capsules = JSON.parse(readFileSync(capsulesFile, 'utf8'))
  }

  const pageName = data.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '.html'

  const dataFileName = pageName.replace('.html', '-data.js')

  let thumbnailPath = data.thumbnail || ''

  if (data.thumbnailPath) {
    const thumbnailFileName = pageName.replace('.html', '') + '.png'
    copyFileSync(data.thumbnailPath, `${thumbnailsFolder}/${thumbnailFileName}`)
    thumbnailPath = `assets/thumbnails/${thumbnailFileName}`
  }

  const capsuleInfo = {
    title: data.title,
    levels: data.levels || [],
    duration: data.duration || '',
    thumbnail: thumbnailPath,
    page: pageName,
    dataFile: dataFileName
  }

  const existingIndex = capsules.findIndex(c => c.title === capsuleInfo.title)

  if (existingIndex >= 0) {
    capsules[existingIndex] = capsuleInfo
  } else {
    capsules.push(capsuleInfo)
  }

  writeFileSync(capsulesFile, JSON.stringify(capsules, null, 2))

  const output = `const capsuleData = ${JSON.stringify(data, null, 2)};`

  writeFileSync(`${siteFolder}/${dataFileName}`, output)

  console.log('Capsule exportée :', data.title)
  console.log('Niveaux :', data.levels)
  console.log('Vignette :', thumbnailPath)

  return true
})

    ipcMain.handle('save-project', async (_, data) => {
    const filename = (data.title || 'capsule')
      .replaceAll(' ', '_')
      .replaceAll('/', '-')
      .replaceAll('\\', '-')

    const output = JSON.stringify(data, null, 2)

    writeFileSync(
      `C:/Users/tetil/Documents/GitHub/mathsaveccecile.github.io/maths-avec-cecile-admin/capsules/${filename}.json`,
      output
    )

    return true
  })
    ipcMain.handle('list-capsules', async () => {
    const folder = 'C:/Users/tetil/Documents/GitHub/mathsaveccecile.github.io/maths-avec-cecile-admin/capsules'

    return readdirSync(folder).filter(file => file.endsWith('.json'))
  })

  ipcMain.handle('open-project', async (_, filename) => {
    const folder = 'C:/Users/tetil/Documents/GitHub/mathsaveccecile.github.io/maths-avec-cecile-admin/capsules'
    const json = readFileSync(`${folder}/${filename}`, 'utf8')

    return json
  })
  ipcMain.handle('import-site', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Importer une capsule du site',
    properties: ['openFile'],
    filters: [
      { name: 'Fichiers data', extensions: ['js'] }
    ]
  })

  if (result.canceled) return null

  const file = result.filePaths[0]

  return readFileSync(file, 'utf8')
})
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})