$ErrorActionPreference = "Stop"
$TestDir = "$env:TEMP\agentos-e2e-test-final"
if (Test-Path $TestDir) { Remove-Item -Recurse -Force $TestDir }
New-Item -ItemType Directory -Path $TestDir | Out-Null
Set-Location $TestDir

$AgentOSPath = "c:\Users\Vansh Kaushal\OneDrive\Desktop\CODE\AgentOS\src\index.ts"

function agentos {
    & "c:\Program Files\nodejs\npx.cmd" ts-node $AgentOSPath @args
}

git init
git commit --allow-empty -m "start"
agentos init

# Rewrite the hook to use ts-node
$hook = "#!/bin/sh`nnpx ts-node ""$AgentOSPath"" _log-commit 2>/dev/null || true`n"
Set-Content -Path .git/hooks/post-commit -Value $hook

agentos use claude
agentos task add "Build user auth module"
agentos task add "Add JWT token validation"
agentos decision add "SQLite only no Postgres" --hard
agentos decision add "No external auth libs" --hard

echo "// auth.ts placeholder" > auth.ts
git add .
git commit -m "add auth module skeleton"

agentos snapshot
agentos report
agentos switch cursor

echo "// jwt.ts" > jwt.ts
git add .
git commit -m "add jwt validation"

agentos report
echo yes | agentos checkpoint
agentos switch opencode

Write-Host "--- ASSERTIONS ---"
Write-Host "execution_log.jsonl lines:"
(Get-Content agentos/execution_log.jsonl).Count
Write-Host "snapshots count:"
(Get-ChildItem agentos/snapshots/).Count

Write-Host "Done with sequence!"
