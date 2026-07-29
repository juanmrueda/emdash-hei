Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
$env:Path = "C:\dev\emdash-hei\.corepack-bin;$env:Path"
Set-Location "C:\dev\emdash-hei\apps\hei-web"
& "C:\dev\emdash-hei\.corepack-bin\pnpm.CMD" exec astro dev --port 4321 2>&1
