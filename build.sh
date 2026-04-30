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
echo "  部署上传清单（传到服务器 /xmc/xihualvye/）："
echo ""
echo "  ✅ 必传："
echo "    server/dist/             (后端 JS)"
echo "    server/public/           (前端静态文件)"
echo "    server/package.json"
echo "    server/package-lock.json"
echo ""
echo "  ❌ 严禁上传（会覆盖生产数据）："
echo "    server/data/             (服务器上的真实数据库)"
echo "    server/node_modules/     (服务器上要重装)"
echo "    server/src/              (源代码不需要)"
echo ""
echo "  服务器上执行："
echo "    cd /xmc/xihualvye"
echo "    npm install --production"
echo "    pm2 restart xihualvye"
echo "========================================"

# 安全提醒
if [ -d "data" ]; then
    echo ""
    echo "⚠️  注意：本地 server/data/ 目录存在，是开发数据库。"
    echo "    上传到服务器时千万不要包含此目录！"
    echo ""
fi
