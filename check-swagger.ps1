# Check Swagger OpenAPI Spec
Write-Host "Waiting for server..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $spec = Invoke-RestMethod -Uri "http://localhost:5000/api/docs-json" -UseBasicParsing
    
    Write-Host "`n=== Checking Course Examples ===" -ForegroundColor Cyan
    
    # Check GET /api/courses
    $getCourses = $spec.paths.'/api/courses'.get.responses.'200'.content.'application/json'.schema.example
    if ($getCourses) {
        Write-Host "`nGET /api/courses example:" -ForegroundColor Green
        Write-Host "Title: $($getCourses[0].title)"
        Write-Host "Code: $($getCourses[0].code)"
        Write-Host "Lecturer: $($getCourses[0].lecturer.name) ($($getCourses[0].lecturer.email))"
        if ($getCourses[0].assignments) {
            Write-Host "Assignments: $($getCourses[0].assignments.Count) items"
        }
        if ($getCourses[0].quizzes) {
            Write-Host "Quizzes: $($getCourses[0].quizzes.Count) items"
        }
    } else {
        Write-Host "No example found for GET /api/courses" -ForegroundColor Red
    }
    
    # Check GET /api/courses/:id
    $getCourse = $spec.paths.'/api/courses/{id}'.get.responses.'200'.content.'application/json'.schema.example
    if ($getCourse) {
        Write-Host "`nGET /api/courses/:id example:" -ForegroundColor Green
        Write-Host "Title: $($getCourse.title)"
        Write-Host "Code: $($getCourse.code)"
        Write-Host "Lecturer: $($getCourse.lecturer.name) ($($getCourse.lecturer.email))"
        if ($getCourse.assignments) {
            Write-Host "Assignments: $($getCourse.assignments.Count) items"
        }
        if ($getCourse.quizzes) {
            Write-Host "Quizzes: $($getCourse.quizzes.Count) items"
        }
    } else {
        Write-Host "No example found for GET /api/courses/:id" -ForegroundColor Red
    }
    
    Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
    Write-Host "OpenAPI spec generated successfully!"
    
} catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure server is running on http://localhost:5000" -ForegroundColor Yellow
}
