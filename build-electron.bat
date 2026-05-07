@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   玺华铝业 - 桌面版打包脚本
echo ========================================
echo.

echo [1/4] 进入 electron 目录...
cd electron
if not exist node_modules\typescript (
    echo [2/4] TypeScript 未安装，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败！请检查网络。
        pause
        exit /b 1
    )
) else (
    echo [2/4] 依赖已安装
)

echo.
echo [3/4] 正在编译 TypeScript 主进程...
call npm run build
if errorlevel 1 (
    echo ❌ TypeScript 编译失败！
    pause
    exit /b 1
)
echo ✅ TypeScript 编译完成
echo.

echo [4/4] 正在打包安装程序...
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
call npm run dist:win
if errorlevel 1 (
    echo ❌ 打包失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 打包完成！
echo.
echo 安装包位置：electron\release\玺华铝业-Setup.exe
echo.
echo 用户首次使用：
echo   1. 双击安装包，按向导安装
echo   2. 启动后填入服务器地址（例如 http://192.168.1.100:3456）
echo   3. 保存后进入系统
echo.
echo 分发方式：直接把 exe 安装包发给用户
echo ========================================
echo.

cd ..
pause
