$ErrorActionPreference = "Stop"
$TestDir = "$env:TEMP\agentos-e2e-test-3"
if (Test-Path $TestDir) { Remove-Item -Recurse -Force $TestDir }
New-Item -ItemType Directory -Path $TestDir | Out-Null
Set-Location $TestDir

# Define agentos command alias mapping to ts-node
function agentos {
    & "c:\Program Files\nodejs\npx.cmd" ts-node "c:\Users\Vansh Kaushal\OneDrive\Desktop\CODE\AgentOS\src\index.ts" $args
}

git init
git commit --allow-empty -m "start"
agentos init
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
# For checkpoint, it might prompt. We will pipe "yes" to it if needed.
# wait, if it prompts, it will block. Let's see if we can do `echo yes | agentos checkpoint`
echo yes | agentos checkpoint

agentos switch opencode

Write-Host "Done with sequence!"
