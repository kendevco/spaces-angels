#!/usr/bin/env pwsh
# KenDev Spaces - Nuclear Database Reset & Rebuild
# Complete database wipe and fresh tenant provisioning

param(
    [Parameter(Mandatory=$false)]
    [string]$TenantName = "KenDev.Co",

    [Parameter(Mandatory=$false)]
    [string]$BusinessType = "service",

    [Parameter(Mandatory=$false)]
    [string]$Theme = "business",

    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

Write-Host "💥 KenDev Spaces - NUCLEAR DATABASE RESET" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  WARNING: This will COMPLETELY DESTROY all database content!" -ForegroundColor Yellow
Write-Host "📊 Target: PostgreSQL at 74.208.87.243:5432" -ForegroundColor Cyan
Write-Host "🏢 New Tenant: $TenantName ($BusinessType)" -ForegroundColor Green
Write-Host ""

if (-not $Force) {
    $confirmation = Read-Host "Type 'NUKE' to proceed with complete database destruction"
    if ($confirmation -ne "NUKE") {
        Write-Host "❌ Operation cancelled" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🔥 NUCLEAR RESET SEQUENCE INITIATED..." -ForegroundColor Red
Write-Host ""

# Step 1: Database destruction via API
Write-Host "💣 Step 1: Nuclear database reset..." -ForegroundColor Yellow
try {
    $resetResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/reseed" -Method POST -Body (@{
        mode = "reset"
        tenant = "kendevco"
        force = $true
    } | ConvertTo-Json) -ContentType "application/json"

    if ($resetResponse.success) {
        Write-Host "✅ Database nuked successfully!" -ForegroundColor Green
    } else {
        throw "Reset failed: $($resetResponse.error)"
    }
} catch {
    Write-Host "❌ API reset failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📋 Manual pgAdmin4 instructions:" -ForegroundColor Yellow
    Write-Host "   1. Connect to 74.208.87.243:5432" -ForegroundColor Gray
    Write-Host "   2. Execute: DROP SCHEMA public CASCADE; CREATE SCHEMA public;" -ForegroundColor Gray
    Write-Host "   3. Press Enter to continue after manual cleanup..." -ForegroundColor Gray
    Read-Host
}

# Step 2: Schema regeneration
Write-Host "🔄 Step 2: Regenerating clean schema..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema regenerated!" -ForegroundColor Green
} else {
    Write-Host "❌ Schema regeneration failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Provision first tenant
Write-Host "🚀 Step 3: Provisioning first tenant: $TenantName..." -ForegroundColor Yellow

$slug = $TenantName.ToLower() -replace '[^a-z0-9\s-]', '' -replace '\s+', '-' -replace '-+', '-'
$slug = $slug.Trim('-')

try {
    $tenantResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/tenant-control" -Method POST -Body (@{
        action = "provision"
        tenantData = @{
            name = $TenantName
            slug = $slug
            businessType = $BusinessType
            theme = $Theme
            features = @("basic", "spaces", "ecommerce")
        }
    } | ConvertTo-Json -Depth 3) -ContentType "application/json"

    if ($tenantResponse.success) {
        Write-Host "🎉 NUCLEAR RESET COMPLETE!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌟 Fresh Tenant Details:" -ForegroundColor Blue
        Write-Host "   📛 Name: $($tenantResponse.tenant.name)" -ForegroundColor White
        Write-Host "   🌐 URL: $($tenantResponse.tenant.previewUrl)" -ForegroundColor Cyan
        Write-Host "   🆔 ID: $($tenantResponse.tenant.id)" -ForegroundColor Gray
        Write-Host "   📦 Space ID: $($tenantResponse.tenant.spaceId)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🚀 Ready for: pnpm dev" -ForegroundColor Green
    } else {
        throw "Tenant provisioning failed: $($tenantResponse.error)"
    }
} catch {
    Write-Host "❌ Tenant provisioning failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "💫 Nuclear reset successful! Database is pristine and ready." -ForegroundColor Green
