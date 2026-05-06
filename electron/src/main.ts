import { app, BrowserWindow, Menu, Tray, dialog, ipcMain, shell, nativeImage } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import * as fs from 'fs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Store = require('electron-store')

// 配置存储（服务器地址、窗口尺寸等，存在用户目录）
const store = new Store({
  defaults: {
    serverUrl: '',           // 后端服务器地址（如 http://192.168.1.100:3456）
    windowBounds: { width: 1440, height: 900 },
    autoLaunch: false,
  },
})

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuiting = false

// 应用图标路径（开发时和打包后不同）
function getAssetPath(filename: string): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', filename)
  }
  return path.join(__dirname, '..', 'assets', filename)
}

// ============ 主窗口 ============
function createMainWindow(): void {
  const bounds = store.get('windowBounds') as { width: number; height: number }

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 1200,
    minHeight: 700,
    icon: getAssetPath('icon.ico'),
    title: '玺华铝业业务管理系统',
    show: false,
    autoHideMenuBar: true, // 隐藏默认菜单栏（文件/编辑/视图等）
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  })

  // 保存窗口尺寸
  mainWindow.on('resize', () => {
    if (!mainWindow) return
    const [width, height] = mainWindow.getSize()
    store.set('windowBounds', { width, height })
  })

  // 窗口就绪后显示（避免白屏）
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 点击关闭按钮：隐藏到托盘而非退出
  mainWindow.on('close', (e) => {
    if (!isQuiting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 外链在默认浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 首次启动若未配置服务器地址，显示配置页；否则直接加载应用
  const serverUrl = store.get('serverUrl') as string
  if (!serverUrl) {
    // 加载内置的服务器配置页
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'config.html'))
  } else {
    mainWindow.loadURL(serverUrl)
  }
}

// ============ 系统托盘 ============
function createTray(): void {
  const iconPath = getAssetPath('icon.ico')
  const trayIcon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty()

  tray = new Tray(trayIcon)
  tray.setToolTip('玺华铝业业务管理系统')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        } else {
          createMainWindow()
        }
      },
    },
    { type: 'separator' },
    {
      label: '配置服务器地址',
      click: showServerConfigDialog,
    },
    {
      label: '检查更新',
      click: () => autoUpdater.checkForUpdates(),
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuiting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

// ============ 服务器地址配置 ============
async function showServerConfigDialog(): Promise<void> {
  if (!mainWindow) return

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'config.html'))
  mainWindow.show()
  mainWindow.focus()
}

// IPC：渲染进程保存/读取服务器地址
ipcMain.handle('get-server-url', () => {
  return store.get('serverUrl') as string
})

ipcMain.handle('set-server-url', async (_event, url: string) => {
  const trimmed = (url || '').trim().replace(/\/$/, '')
  if (!/^https?:\/\//.test(trimmed)) {
    return { success: false, message: '地址必须以 http:// 或 https:// 开头' }
  }
  store.set('serverUrl', trimmed)
  if (mainWindow) {
    mainWindow.loadURL(trimmed)
  }
  return { success: true }
})

ipcMain.handle('test-server', async (_event, url: string) => {
  try {
    const trimmed = (url || '').trim().replace(/\/$/, '')
    const res = await fetch(`${trimmed}/api/health`)
    const data = await res.json()
    return { success: res.ok && data.code === 0, message: data.message || '' }
  } catch (e: any) {
    return { success: false, message: e?.message || '连接失败' }
  }
})

// ============ 自动更新 ============
function setupAutoUpdater(): void {
  // 生产环境才检查更新
  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update-available', info)
  })

  autoUpdater.on('update-downloaded', async () => {
    const result = await dialog.showMessageBox({
      type: 'info',
      title: '新版本已下载',
      message: '已下载新版本，是否立即重启应用以完成更新？',
      buttons: ['立即重启', '稍后'],
      defaultId: 0,
      cancelId: 1,
    })
    if (result.response === 0) {
      isQuiting = true
      autoUpdater.quitAndInstall()
    }
  })

  autoUpdater.on('error', (err) => {
    console.error('自动更新错误:', err)
  })

  // 启动 30 秒后检查一次，之后每 2 小时检查一次
  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 30_000)
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 2 * 60 * 60 * 1000)
}

// ============ 单实例锁定（避免用户多开） ============
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      if (!mainWindow.isVisible()) mainWindow.show()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    createMainWindow()
    createTray()
    setupAutoUpdater()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  })
}

app.on('window-all-closed', () => {
  // macOS 惯例不退出，其他平台保持后台常驻（托盘）
  // 如需要窗口关闭时退出，改为 app.quit()
})

app.on('before-quit', () => {
  isQuiting = true
})
