#!/bin/bash
echo "========================================"
echo "  玺华铝业 - 一键打包部署脚本"
echo "========================================"
echo ""

echo "[1/5] 正在打包前端..."
cd xihualvye
npm run build-only
if [ $? -ne 0 ]; then
    echo "❌ 前端打包失败！"
    exit 1
fi
echo "✅ 前端打包完成"
echo ""

echo "[2/5] 正在复制前端文件到后端..."
cd ..
rm -rf server/public
cp -r xihualvye/dist server/public
echo "✅ 前端文件复制完成"
echo ""

echo "[3/5] 正在编译后端 TypeScript..."
cd server
npx tsc
if [ $? -ne 0 ]; then
    echo "❌ 后端编译失败！"
    exit 1
fi
echo "✅ 后端编译完成"
echo ""

echo "[4/5] 正在安装后端依赖..."
npm install --production
echo "✅ 后端依赖安装完成"
echo ""

echo "[5/5] 打包完成！"
echo ""
echo "========================================"
echo "  部署说明："
echo "  用 XFTP 上传 dist/ public/ package.json 到服务器"
echo "  上传后在服务器执行："
echo "    cd /xmc/xihualvye"
echo "    npm install --production"
echo "    pm2 restart xihualvye"
echo "========================================"
