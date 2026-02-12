Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\NUEVAS SALAS MUCH\Juego_Spinosaurio\saurio.png')
Write-Output "$($img.Width)x$($img.Height)"
$img.Dispose()
