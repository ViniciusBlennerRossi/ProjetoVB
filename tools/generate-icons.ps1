# Gera os ícones do PWA a partir de Imagens/Fiore-logo.png
# Recorta margens vazias (brancas/transparentes) e centraliza a arte no canvas quadrado.
# Rodar: powershell -ExecutionPolicy Bypass -File tools\generate-icons.ps1
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $root 'Imagens\Fiore-logo.png'
$outDir  = Join-Path $root 'icons'

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$src = [System.Drawing.Image]::FromFile($srcPath)

# --- Detecta o bounding box do conteúdo numa versão reduzida (rápido) ---
$probeW = 400
$probeH = [int]($src.Height * $probeW / $src.Width)
$probe = New-Object System.Drawing.Bitmap($probeW, $probeH)
$pg = [System.Drawing.Graphics]::FromImage($probe)
$pg.Clear([System.Drawing.Color]::White)
$pg.DrawImage($src, 0, 0, $probeW, $probeH)
$pg.Dispose()

$minX = $probeW; $minY = $probeH; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $probeH; $y++) {
  for ($x = 0; $x -lt $probeW; $x++) {
    $p = $probe.GetPixel($x, $y)
    if ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$probe.Dispose()

# Mapeia o bbox de volta para as coordenadas da imagem original (com 2% de folga)
$fx = $src.Width / $probeW
$pad = 0.02 * ($maxX - $minX)
$cropX = [Math]::Max(0, ($minX - $pad) * $fx)
$cropY = [Math]::Max(0, ($minY - $pad) * $fx)
$cropW = [Math]::Min($src.Width  - $cropX, ($maxX - $minX + 2*$pad) * $fx)
$cropH = [Math]::Min($src.Height - $cropY, ($maxY - $minY + 2*$pad) * $fx)
$srcRect = New-Object System.Drawing.RectangleF($cropX, $cropY, $cropW, $cropH)
Write-Host "Conteudo detectado: $([int]$cropW) x $([int]$cropH) em ($([int]$cropX), $([int]$cropY))"

function New-Icon([int]$size, [string]$outName, [double]$logoFraction) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::White)

  $box = $size * $logoFraction
  $scale = [Math]::Min($box / $srcRect.Width, $box / $srcRect.Height)
  $w = $srcRect.Width * $scale
  $h = $srcRect.Height * $scale
  $x = ($size - $w) / 2
  $y = ($size - $h) / 2
  $destRect = New-Object System.Drawing.RectangleF($x, $y, $w, $h)
  $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()

  $outPath = Join-Path $outDir $outName
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "Gerado: $outPath ($size x $size)"
}

New-Icon 512 'icon-512.png'          0.84
New-Icon 192 'icon-192.png'          0.84
New-Icon 512 'icon-maskable-512.png' 0.62
New-Icon 192 'icon-maskable-192.png' 0.62
New-Icon 180 'apple-touch-icon.png'  0.84

$src.Dispose()
Write-Host 'Concluido.'
