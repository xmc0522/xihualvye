# 玺华铝业业务管理系统 - 桌面版

基于 Electron 的 Windows 桌面客户端，联网访问中央服务器。

## 架构

```
用户电脑                           中央服务器 (如 192.168.1.100:3456)
┌────────────────────┐              ┌─────────────────────────┐
│ 玺华铝业.exe        │              │ Node.js 后端 (Express)   │
│                    │  HTTP 请求   │   ├─ /api/*  业务 API    │
│ ┌────────────────┐ │◄────────────►│   ├─ /login  登录接口    │
│ │ Electron       │ │              │   └─ 托管前端静态文件    │
│ │ └ Chromium     │ │              │                         │
│ │   渲染 Vue 前端 │ │              │ SQLite 数据库            │
│ └────────────────┘ │              │   └─ xihualvye.db       │
│                    │              └─────────────────────────┘
│ 本地配置          │
│ └─ 服务器地址      │
│   (userData)      │
└────────────────────┘
```

## 开发调试

```bash
# 1. 安装依赖
cd electron
npm install

# 2. 启动开发模式（需要先启动后端服务器）
npm run dev
```

首次启动会显示服务器配置页，填入后端地址（如 `http://localhost:3456`）即可。

## 打包安装程序

在**项目根目录**执行（推荐）：
```bat
build-electron.bat
```

或手动：
```bash
cd electron
npm install          # 首次打包
npm run dist:win     # 生成 Windows 安装程序
```

打包产物：`electron/release/玺华铝业-Setup-1.0.0.exe`

## 功能特性

- ✅ **首次启动配置服务器**：用户填入后端地址，之后自动保存
- ✅ **系统托盘**：关闭窗口不退出，可托盘快速唤出
- ✅ **单实例锁定**：避免用户重复启动多个
- ✅ **窗口尺寸记忆**：下次启动保持上次的尺寸
- ✅ **自动更新**：`electron-updater` 自动检查新版并提示重启
- ✅ **桌面快捷方式**：安装后自动在桌面创建
- ✅ **免管理员权限**：安装到用户目录（不需要 UAC）
- ✅ **中文安装向导**：NSIS 简体中文界面
- ✅ **卸载保留数据**：重装应用不会丢失服务器地址配置

## 用户数据位置

| 数据 | 路径 |
|------|------|
| 服务器地址配置 | `%APPDATA%\玺华铝业业务管理系统\config.json` |
| 窗口尺寸 | 同上 |
| 登录凭据 | localStorage（由 Vue 应用管理，存储于 `%APPDATA%` 下） |
| 业务数据（订单等） | **在服务器上**，不在本地 |

## 自动更新流程

### 服务器端（管理员）
1. 新版 exe 打包好后，上传到更新服务器
2. 更新 `latest.yml`（electron-builder 自动生成在 `release/` 目录）
3. 结构：
   ```
   https://your-update-server.com/xihualvye-updates/
     ├── latest.yml
     ├── 玺华铝业-Setup-1.0.1.exe
     └── 玺华铝业-Setup-1.0.1.exe.blockmap
   ```
4. 修改 `electron-builder.yml` 里的 `publish.url` 指向你的服务器地址

### 客户端
- 启动后 30 秒自动检查一次
- 之后每 2 小时检查一次
- 检测到新版本自动下载
- 下载完成弹窗提示用户"立即重启更新"或"稍后"
- 也可以右键系统托盘 → "检查更新" 手动触发

## 配置文件说明

### `electron-builder.yml`
关键配置项：
- `appId`: 应用唯一标识，改后原有安装会变为"不同应用"
- `productName`: 桌面图标/开始菜单显示的名字
- `win.publisherName`: 安装时 UAC 弹窗显示的发布者
- `nsis.perMachine: false`: 安装到用户目录（推荐，免管理员）
- `publish.url`: 自动更新的服务器地址

### 图标
- `assets/icon.ico`: Windows 应用图标（256x256，多分辨率 ico）
- `assets/icon.png`: 源文件（electron-builder 会自动生成 mac/linux 所需格式）

## 常见问题

### Q: 用户打开客户端白屏？
A: 可能服务器不可达。右键托盘 → "配置服务器地址"，重新输入并测试。

### Q: 更新服务器在哪搭？
A: 任何支持静态文件的 HTTPS 服务器都可以，例如：
- 阿里云 OSS / 腾讯云 COS
- nginx 静态目录
- GitHub Releases（私有仓库需要 token）

### Q: 打包时提示缺少代码签名？
A: 可以忽略（NSIS 会正常打出 exe）。若要消除 Windows Defender 警告，需申请代码签名证书（商业证书 ¥500-2000/年）。

### Q: 用户能修改服务器地址吗？
A: 可以。系统托盘右键 → "配置服务器地址" 重新配置。
