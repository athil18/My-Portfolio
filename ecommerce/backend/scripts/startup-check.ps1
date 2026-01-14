# Infrastructure Startup Check Script
# Checks MongoDB, Redis, and Backend availability

$LogFile = "logs/startup_repair.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }

function Write-Log($Message) {
    $LogEntry = "[$Timestamp] $Message"
    Add-Content -Path $LogFile -Value $LogEntry
    Write-Host $LogEntry
}

function Test-Port($HostAddr, $PortNumber) {
    $Tcp = New-Object System.Net.Sockets.TcpClient
    $Wait = $Tcp.BeginConnect($HostAddr, $PortNumber, $null, $null)
    $Success = $Wait.AsyncWaitHandle.WaitOne(1000, $false)
    if ($Success -and $Tcp.Connected) {
        $Tcp.Close()
        return $true
    }
    return $false
}

Write-Host "--- Infrastructure Health Check ---"

# Check MongoDB
$MongoStatus = if (Test-Port -HostAddr "localhost" -PortNumber 27017) { "RUNNING" } else { "NOT RUNNING" }
Write-Log "MongoDB (27017): $MongoStatus"

# Check Redis
$RedisStatus = if (Test-Port -HostAddr "localhost" -PortNumber 6379) { "RUNNING" } else { "NOT RUNNING" }
Write-Log "Redis (6379): $RedisStatus"

# Check Backend
$BackendStatus = if (Test-Port -HostAddr "localhost" -PortNumber 5000) { "RUNNING" } else { "NOT RUNNING" }
Write-Log "Backend (5000): $BackendStatus"

# Check Frontend
$FrontendStatus = if (Test-Port -HostAddr "localhost" -PortNumber 5173) { "RUNNING" } else { "NOT RUNNING" }
Write-Log "Frontend (5173): $FrontendStatus"

Write-Host "--- End of Check ---"
