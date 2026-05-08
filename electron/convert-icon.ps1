# 将 icon.png 转换为真正的多尺寸 ICO 文件
# 用法：powershell -ExecutionPolicy Bypass -File .\convert-icon.ps1

$ErrorActionPreference = 'Stop'

$assetsDir = Join-Path $PSScriptRoot 'assets'
$pngPath   = Join-Path $assetsDir 'icon.png'
$icoPath   = Join-Path $assetsDir 'icon.ico'

if (-not (Test-Path $pngPath)) {
    Write-Host "[错误] 找不到 $pngPath" -ForegroundColor Red
    exit 1
}

# 1) 先看一眼当前 icon.ico 的前 4 字节（合法 ICO 应为 00 00 01 00）
if (Test-Path $icoPath) {
    $head = [System.IO.File]::ReadAllBytes($icoPath) | Select-Object -First 4
    $hex  = ($head | ForEach-Object { $_.ToString('X2') }) -join ' '
    Write-Host "旧 icon.ico 前 4 字节: $hex (合法 ICO 应为 00 00 01 00)" -ForegroundColor Yellow
}

Add-Type -AssemblyName System.Drawing

# 2) 加载 PNG 源图
$src = [System.Drawing.Image]::FromFile($pngPath)

# 3) 要打包到 ICO 的尺寸
$sizes = @(16, 24, 32, 48, 64, 128, 256)

# 4) 为每个尺寸生成 PNG 字节流
$pngStreams = @()
foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $s, $s
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $s, $s)
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    $pngStreams += ,@{ Size = $s; Bytes = $ms.ToArray() }
}

$src.Dispose()

# 5) 写 ICO 文件（ICONDIR + ICONDIRENTRY[] + PNG 数据）
$fs = [System.IO.File]::Create($icoPath)
$bw = New-Object System.IO.BinaryWriter $fs

# ICONDIR
$bw.Write([uint16]0)                 # Reserved
$bw.Write([uint16]1)                 # Type: 1 = icon
$bw.Write([uint16]$pngStreams.Count) # Count

# 目录项偏移起点
$offset = 6 + 16 * $pngStreams.Count

# ICONDIRENTRY
foreach ($item in $pngStreams) {
    $s   = $item.Size
    $len = $item.Bytes.Length
    $w   = if ($s -ge 256) { 0 } else { [byte]$s }  # 256 用 0 表示
    $h   = $w
    $bw.Write([byte]$w)        # bWidth
    $bw.Write([byte]$h)        # bHeight
    $bw.Write([byte]0)         # bColorCount
    $bw.Write([byte]0)         # bReserved
    $bw.Write([uint16]1)       # wPlanes
    $bw.Write([uint16]32)      # wBitCount
    $bw.Write([uint32]$len)    # dwBytesInRes
    $bw.Write([uint32]$offset) # dwImageOffset
    $offset += $len
}

# PNG 数据
foreach ($item in $pngStreams) {
    $bw.Write($item.Bytes)
}

$bw.Flush()
$bw.Close()
$fs.Close()

# 6) 校验新生成的 ICO 文件头
$head2 = [System.IO.File]::ReadAllBytes($icoPath) | Select-Object -First 4
$hex2  = ($head2 | ForEach-Object { $_.ToString('X2') }) -join ' '
Write-Host "新 icon.ico 前 4 字节: $hex2 (应为 00 00 01 00)" -ForegroundColor Green
Write-Host "ICO 已生成: $icoPath (尺寸: $($sizes -join ', '))" -ForegroundColor Green

