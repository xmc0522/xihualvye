@echo off
chcp 65001 >nul
echo ========================================
echo   玺华铝业 - 一键打包部署脚本
echo ========================================
echo.

echo [1/5] 正在打包前端...
cd xihualvye
call npm run build-only
if errorlevel 1 (
    echo ❌ 前端打包失败！
    pause
    exit /b 1
)
echo ✅ 前端打包完成
echo.

echo [2/5] 正在复制前端文件到后端...
cd ..
if exist server\public rmdir /s /q server\public
xcopy /e /i /q xihualvye\dist server\public
echo ✅ 前端文件复制完成
echo.

echo [3/5] 正在编译后端 TypeScript...
cd server
call npx tsc
if errorlevel 1 (
    echo ❌ 后端编译失败！
    pause
    exit /b 1
)
echo ✅ 后端编译完成
echo.

echo [4/5] 正在安装后端依赖...
call npm install --production
echo ✅ 后端依赖安装完成
echo.

echo [5/5] 打包完成！
echo.
echo ========================================
echo   部署说明：
echo   用 XFTP 上传以下文件到服务器 /xmc/xihualvye/
echo.
echo   需要上传的：
echo     dist/         (编译后的后端JS)
echo     public/       (前端静态文件)
echo     package.json
echo     package-lock.json
echo.
echo   不要上传的：
echo     data/          (线上数据库，覆盖会丢数据)
echo     node_modules/  (要在服务器上重新装)
echo     src/           (源码，服务器不需要)
echo.
echo   上传后在服务器执行：
echo     cd /xmc/xihualvye
echo     npm install --production
echo     pm2 restart xihualvye
echo ========================================
echo.
pause
