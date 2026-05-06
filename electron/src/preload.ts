import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程（Vue）的安全 API
contextBridge.exposeInMainWorld('xhly', {
  /** 是否运行在 Electron 环境 */
  isDesktop: true,

  /** 读取当前配置的后端地址 */
  getServerUrl: (): Promise<string> => ipcRenderer.invoke('get-server-url'),

  /** 保存后端地址并重新加载 */
  setServerUrl: (url: string): Promise<{ success: boolean; message?: string }> =>
    ipcRenderer.invoke('set-server-url', url),

  /** 测试服务器连通性 */
  testServer: (url: string): Promise<{ success: boolean; message?: string }> =>
    ipcRenderer.invoke('test-server', url),

  /** 监听"发现新版本"事件 */
  onUpdateAvailable: (callback: (info: any) => void): void => {
    ipcRenderer.on('update-available', (_event, info) => callback(info))
  },
})
