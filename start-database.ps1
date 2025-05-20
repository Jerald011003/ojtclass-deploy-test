# Get database connection details from environment variables
$env:DATABASE_URL = Get-Content .env | Select-String "^DATABASE_URL=" | ForEach-Object { $_.ToString().Split('=')[1] }
$dbUrl = [System.Uri]$env:DATABASE_URL

# Parse connection details
$dbPassword = $dbUrl.UserInfo.Split(':')[1]
$dbName = $dbUrl.Segments[1].TrimEnd('/')
$containerName = "$dbName-postgres"
$port = 5432

# Check if container exists
$containerExists = docker ps -a --filter "name=$containerName" --format '{{.Names}}' | Select-String $containerName

if ($containerExists) {
    Write-Host "Container $containerName already exists. Starting it..."
    docker start $containerName
} else {
    Write-Host "Creating and starting database container..."
    docker run --name $containerName `
        -e POSTGRES_PASSWORD=$dbPassword `
        -e POSTGRES_DB=$dbName `
        -p ${port}:5432 `
        -d postgres:15
}

Write-Host "Waiting for database to be ready..."
Start-Sleep -Seconds 3

Write-Host "Database is ready at: $env:DATABASE_URL"
Write-Host "To stop the database, run: docker stop $containerName"
