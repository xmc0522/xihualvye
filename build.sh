#!/bin/bash
echo "========================================"
echo "  玺华铝业 - 一键打包部署脚本"
echo "========================================"
echo ""

echo "[1/4] 正在打包前端..."
cd xihualvye
npm run build-only
if [ $? -ne 0 ]; then
    echo "❌ 前端打包失败！"
    exit 1
fi
echo "✅ 前端打包完成"
echo ""

echo "[2/4] 正在复制前端文件到后端..."
cd ..
rm -rf server/public
cp -r xihualvye/dist server/public
echo "✅ 前端文件复制完成"
echo ""

echo "[3/4] 正在安装后端依赖..."
cd server
npm install --production
echo "✅ 后端依赖安装完成"
echo ""

echo "[4/4] 打包完成！"
echo ""
echo "========================================"
echo "  部署说明："
echo "  将整个 server 文件夹上传到服务器"
echo "  在服务器上执行："
echo "    cd server"
echo "    npm start"
echo "  或使用 PM2 守护："
echo "    pm2 start \"npx tsx src/index.ts\" --name xihualvye"
echo "========================================"
