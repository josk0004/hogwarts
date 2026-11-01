# Pseudokode for Hogwarts API


## Fælles regler

Alle endpoints skal:

1. Modtage requesten gennem den relevante route.
2. Lade controlleren læse parametre og request-body.
3. Validere id'er og inputdata, før der arbejdes videre.
4. Lade repository-laget hente eller ændre data.
5. Lade repository-laget være det eneste lag, der kender SQL.
6. Sende resultatet tilbage med den relevante HTTP-statuskode.
7. Ved uventede fejl logges fejlen, og klienten får en serverfejl.

### Validering af id

```text
Læs id fra URL'en
Forsøg at omdanne id til et helt tal
Hvis id ikke er et helt tal:
    returner 400 Bad Request med "Invalid id"
Ellers:
    fortsæt med id'et
```

### Fejl ved manglende data

```text
Bed repository om at finde den ønskede post
Hvis posten ikke findes:
    returner 404 Not Found
Ellers:
    returner posten
```

### Simpel liste-visning

Dette mønster bruges af `GET /houses`, `GET /teachers` og `GET /students`.

```text
Bed det relevante repository om alle poster
Repository sorterer posterne efter id
Returner posterne som JSON med 200 OK
```

## Houses

### GET /houses

Brug mønsteret **Simpel liste-visning**.

Hent alle houses og returner dem som en liste med `id` og `name`.

### GET /houses/:id

Brug mønsteret **Validering af id** og derefter **Fejl ved manglende data**.

```text
Valider id
Bed houses-repository om house med id'et
Hvis house ikke findes:
    returner 404 Not Found med "House not found"
Ellers:
    returner house som JSON med 200 OK
```

## Teachers

### GET /teachers

Brug mønsteret **Simpel liste-visning**.

Hent alle teachers. Hver teacher returneres med lærerens house-oplysninger.

### GET /teachers/:id

Brug mønsteret **Validering af id** og derefter **Fejl ved manglende data**.

```text
Valider id
Bed teachers-repository om teacher med id'et
Hvis teacher ikke findes:
    returner 404 Not Found med "Teacher not found"
Ellers:
    returner teacher med house-oplysninger som JSON med 200 OK
```

### POST /teachers

```text
Læs name og house_id fra request-body
Trim name
Hvis name mangler eller er tom:
    returner 400 Bad Request med "name is required"
Hvis house_id ikke er et helt tal:
    returner 400 Bad Request med "house_id must be an integer"

Bed teachers-repository om at oprette teacher med name og house_id
Hvis den angivne house ikke findes:
    returner 400 Bad Request med "house_id does not exist"
Ellers:
    hent den nyoprettede teacher med house-oplysninger
    returner den med 201 Created
```

### PUT /teachers/:id

```text
Valider id
Læs og valider name og house_id som ved POST /teachers

Bed teachers-repository om at erstatte teacherens name og house_id
Hvis teacher ikke findes:
    returner 404 Not Found med "Teacher not found"
Hvis den angivne house ikke findes:
    returner 400 Bad Request med "house_id does not exist"
Ellers:
    hent den opdaterede teacher med house-oplysninger
    returner den med 200 OK
```

### DELETE /teachers/:id

```text
Valider id
Bed teachers-repository om at slette teacher
Hvis teacher ikke findes:
    returner 404 Not Found med "Teacher not found"
Hvis teacher stadig bruges af et eller flere courses:
    returner 409 Conflict med "Teacher still has courses"
Ellers:
    returner 204 No Content
```

## Students

### GET /students

Brug mønsteret **Simpel liste-visning**.

Hent alle students. Hver student returneres med studentens house-oplysninger.

### GET /students/:id

Brug mønsteret **Validering af id** og derefter **Fejl ved manglende data**.

```text
Valider id
Bed students-repository om student med id'et
Hvis student ikke findes:
    returner 404 Not Found med "Student not found"
Ellers:
    returner student med house-oplysninger som JSON med 200 OK
```

### POST /students

Følg samme proces som `POST /teachers`:

```text
Læs og valider name og house_id
Opret student via students-repository
Hvis house_id ikke findes:
    returner 400 Bad Request
Ellers:
    hent den nyoprettede student med house-oplysninger
    returner den med 201 Created
```

### PUT /students/:id

Følg samme proces som `PUT /teachers/:id`:

```text
Valider id
Læs og valider name og house_id
Opdater student via students-repository
Hvis student ikke findes:
    returner 404 Not Found
Hvis house_id ikke findes:
    returner 400 Bad Request
Ellers:
    returner den opdaterede student med 200 OK
```

### DELETE /students/:id

```text
Valider id
Bed students-repository om at slette student
Hvis student ikke findes:
    returner 404 Not Found med "Student not found"
Ellers:
    returner 204 No Content
```

## Courses

Et course returneres med:

- course-oplysninger
- teacher-oplysninger
- en liste over tilknyttede students

### GET /courses

```text
Bed courses-repository om alle courses
Repository samler hvert course med teacher og students
Sortér courses efter id
Returner listen som JSON med 200 OK
```

### GET /courses/:id

Brug mønsteret **Validering af id** og derefter **Fejl ved manglende data**.

```text
Valider id
Bed courses-repository om course med id'et
Hvis course ikke findes:
    returner 404 Not Found med "Course not found"
Ellers:
    returner course med teacher og students som JSON med 200 OK
```

### POST /courses

```text
Læs name og teacher_id fra request-body
Trim name
Hvis name mangler eller er tom:
    returner 400 Bad Request med "name is required"
Hvis teacher_id ikke er et helt tal:
    returner 400 Bad Request med "teacher_id must be an integer"

Bed courses-repository om at oprette course
Hvis teacher_id ikke findes:
    returner 400 Bad Request med "teacher_id does not exist"
Ellers:
    hent det nye course med teacher og students
    returner det med 201 Created
```

### PUT /courses/:id

Opdater kun course-navnet.

```text
Valider id
Læs og trim name
Hvis name mangler eller er tom:
    returner 400 Bad Request med "name is required"

Bed courses-repository om at opdatere navnet
Hvis course ikke findes:
    returner 404 Not Found med "Course not found"
Ellers:
    hent det opdaterede course med teacher og students
    returner det med 200 OK
```

### PUT /courses/:id/teacher

```text
Valider course-id
Læs teacher_id fra request-body
Hvis teacher_id ikke er et helt tal:
    returner 400 Bad Request med "teacher_id must be an integer"

Bed courses-repository om at ændre course'ets teacher
Hvis course ikke findes:
    returner 404 Not Found med "Course not found"
Hvis teacher_id ikke findes:
    returner 400 Bad Request med "teacher_id does not exist"
Ellers:
    hent course med den nye teacher og dets students
    returner det med 200 OK
```

### POST /courses/:id/students

```text
Valider course-id
Læs student_id fra request-body
Hvis student_id ikke er et helt tal:
    returner 400 Bad Request med "student_id must be an integer"

Kontrollér at course findes
Hvis course ikke findes:
    returner 404 Not Found med "Course not found"

Bed courses-repository om at tilknytte studenten til kurset
Hvis student_id ikke findes:
    returner 400 Bad Request med "student_id does not exist"
Hvis studenten allerede er tilknyttet:
    returner 409 Conflict med "Student is already in this course"
Ellers:
    hent course med den nye studentliste
    returner det med 201 Created
```

### DELETE /courses/:id/students/:studentId

```text
Valider course-id og studentId
Hvis et af id'erne ikke er et helt tal:
    returner 400 Bad Request med "Invalid id"

Kontrollér at course findes
Hvis course ikke findes:
    returner 404 Not Found med "Course not found"

Bed courses-repository om at fjerne studenten fra kurset
Hvis studenten ikke er tilknyttet kurset:
    returner 404 Not Found med "Student is not in this course"
Ellers:
    hent course med den opdaterede studentliste
    returner det med 200 OK
```

### DELETE /courses/:id

```text
Valider id
Bed courses-repository om at slette course
Hvis course ikke findes:
    returner 404 Not Found med "Course not found"
Ellers:
    returner 204 No Content
```
