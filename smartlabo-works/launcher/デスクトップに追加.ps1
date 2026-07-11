# Smart Labo Works — デスクトップショートカット作成スクリプト
# このスクリプトを右クリック → 「PowerShellで実行」してください

$vbsPath   = "C:\Users\user\Desktop\TOEICアプリ\smartlabo-works\launcher\start.vbs"
$iconPath  = "C:\Users\user\Desktop\TOEICアプリ\smartlabo-works\launcher\icon.ico"
$shortcut  = "$env:USERPROFILE\Desktop\Smart Labo Works.lnk"

# ============================
# ICOファイルを生成（SVGから変換）
# ============================
Add-Type -AssemblyName System.Drawing

function Create-SLWIcon {
    param([string]$OutputPath)

    $sizes = @(256, 64, 32, 16)
    $bitmaps = @()

    foreach ($size in $sizes) {
        $bmp = New-Object System.Drawing.Bitmap($size, $size)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

        # 背景 — Navy
        $navy = [System.Drawing.Color]::FromArgb(255, 10, 27, 61)
        $g.Clear($navy)

        # 角丸の背景（アイコン枠）
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 27, 61))
        $radius = [int]($size * 0.15)
        $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
        $g.FillRectangle($brush, $rect)

        # Smart Blue のグラデーション「S」文字
        $font = New-Object System.Drawing.Font("Segoe UI", ($size * 0.55), [System.Drawing.FontStyle]::Bold)
        $brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 212, 255))

        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

        $rectF = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
        $g.DrawString("S", $font, $brush2, $rectF, $sf)

        # 外枠（Smart Blue）
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 37, 99, 235), ($size * 0.03))
        $g.DrawRectangle($pen, 2, 2, $size-4, $size-4)

        $g.Dispose()
        $bitmaps += $bmp
    }

    # ICO ファイルとして保存
    $ms = New-Object System.IO.MemoryStream
    # ICO header
    $bw = New-Object System.IO.BinaryWriter($ms)
    $bw.Write([uint16]0)      # reserved
    $bw.Write([uint16]1)      # type: ICO
    $bw.Write([uint16]$bitmaps.Count)  # image count

    # 各サイズのBMPをメモリに書き出し
    $imageStreams = @()
    foreach ($bmp in $bitmaps) {
        $ims = New-Object System.IO.MemoryStream
        $bmp.Save($ims, [System.Drawing.Imaging.ImageFormat]::Png)
        $imageStreams += $ims
    }

    # ディレクトリエントリを書く
    $offset = 6 + ($bitmaps.Count * 16)
    for ($i = 0; $i -lt $bitmaps.Count; $i++) {
        $s = $sizes[$i]
        $entry = if ($s -ge 256) { 0 } else { $s }
        $bw.Write([byte]$entry)   # width
        $bw.Write([byte]$entry)   # height
        $bw.Write([byte]0)        # color count
        $bw.Write([byte]0)        # reserved
        $bw.Write([uint16]1)      # planes
        $bw.Write([uint16]32)     # bit count
        $bw.Write([uint32]$imageStreams[$i].Length)
        $bw.Write([uint32]$offset)
        $offset += $imageStreams[$i].Length
    }

    foreach ($ims in $imageStreams) {
        $bw.Write($ims.ToArray())
    }

    [System.IO.File]::WriteAllBytes($OutputPath, $ms.ToArray())

    foreach ($bmp in $bitmaps) { $bmp.Dispose() }
    Write-Host "✅ アイコンを作成しました: $OutputPath" -ForegroundColor Cyan
}

# ICO作成
Create-SLWIcon -OutputPath $iconPath

# ============================
# デスクトップショートカット作成
# ============================
$WshShell = New-Object -ComObject WScript.Shell
$lnk = $WshShell.CreateShortcut($shortcut)
$lnk.TargetPath       = "wscript.exe"
$lnk.Arguments        = "`"$vbsPath`""
$lnk.WorkingDirectory = "C:\Users\user\Desktop\TOEICアプリ\smartlabo-works"
$lnk.Description      = "Smart Labo Works — 株式会社スマートラボ Company OS"
$lnk.IconLocation     = "$iconPath, 0"
$lnk.WindowStyle      = 1
$lnk.Save()

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "✅ デスクトップに「Smart Labo Works」を追加しました！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "📌 使い方:" -ForegroundColor Yellow
Write-Host "   デスクトップの「Smart Labo Works」をダブルクリックするだけ！"
Write-Host "   → サーバーが自動起動"
Write-Host "   → アプリウィンドウが開きます"
Write-Host ""

Start-Sleep -Seconds 3
