# Pseudokode for Hogwarts API

## Fælles regler

- Route modtager kaldet og sender det videre til den relevante controller.
- Controller læser id og data fra requesten.
- Controller validerer input.
- Controller beder repository om data eller ændringer.
- Repository udfører SQL.
- Controller sender resultatet eller en fejl tilbage som response.

## GET alle

Gælder for:

- `GET /houses`
- `GET /teachers`
- `GET /students`
- `GET /courses`
- `GET /grades`
- `GET /exams`

```text
Modtag request
Hent alle relevante data fra repository
Returner data som JSON
Hvis databasen fejler, returner serverfejl
```

## GET én med id

Gælder for:

- `GET /houses/:id`
- `GET /teachers/:id`
- `GET /students/:id`
- `GET /courses/:id`
- `GET /exams/:id`

```text
Læs id fra URL
Validér id med `IdDto` og Zod
Hent objektet fra repository
Hvis objektet ikke findes, returner 404
Ellers returner objektet som JSON
Hvis databasen fejler, returner serverfejl
```

## DTO-validering

Alle input-DTO'er valideres med Zod. Multipart-felter kommer ind som
tekst, så tal og boolean-værdier konverteres før validering. Ved ugyldigt
input returneres status 400 med valideringsfejlen.

DTO'erne er:

- `TeacherDto`
- `StudentDto`
- `CourseDto`
- `CourseDetailsDto`
- `ExamDto`
- `IdDto`
- `TeacherIdDto`
- `StudentIdDto`

## Opret teacher

```text
Læs name, house_id, employment_start, currently_active og deceased
Validér request body med TeacherDto og Zod
Kontrollér navn, hus-id, dato og boolean-værdier
Kontrollér at en aktiv lærer ikke starter i fremtiden
Opret læreren via repository
Hent den nye lærer
Returner læreren med status 201
Hvis huset ikke findes, returner 400
Hvis databasen fejler, returner serverfejl
```

## Opret student

Gælder for `POST /students`.

```text
Læs name, house_id, birthday og school_year
Validér request body med StudentDto og Zod
Kontrollér navn, hus-id, dato og skoleår mellem 1 og 7
Opret studenten via repository
Hent den nye student
Returner studenten med status 201
Hvis huset ikke findes, returner 400
Hvis databasen fejler, returner serverfejl
```

## Opdatér teacher eller student

Gælder for:

- `PUT /teachers/:id`
- `PUT /students/:id`

```text
Læs id fra URL
Validér id med IdDto og Zod
Læs alle felter fra den relevante request body
Validér med TeacherDto eller StudentDto og Zod
Opdatér personen via repository
Hvis personen ikke findes, returner 404
Hent den opdaterede person
Returner personen som JSON
Hvis huset ikke findes, returner 400
Hvis databasen fejler, returner serverfejl
```

## Slet teacher eller student

Gælder for:

- `DELETE /teachers/:id`
- `DELETE /students/:id`

```text
Læs id fra URL
Validér id med IdDto og Zod
Slet personen via repository
Hvis personen ikke findes, returner 404
Returner status 204 uden indhold
Hvis databasen fejler, returner serverfejl
```

## Opret course

Gælder for `POST /courses`.

```text
Læs name, teacher_id, type, level og school_year
Validér request body med CourseDto og Zod
Kontrollér course type, level og skoleår
Kontrollér at OWL gælder for skoleår 1-5 og NEWT for skoleår 6-7
Opret kurset via repository
Hent det nye kursus med lærer og studerende
Returner kurset med status 201
Hvis læreren ikke findes, returner 400
Hvis databasen fejler, returner serverfejl
```

## Opdatér course

Gælder for `PUT /courses/:id`.

```text
Læs id fra URL
Validér id med IdDto og Zod
Læs name, type, level og school_year fra request body
Validér request body med CourseDetailsDto og Zod
Opdatér kursusdetaljerne via repository
Hvis kurset ikke findes, returner 404
Hent det opdaterede kursus
Returner kurset som JSON
Hvis databasen fejler, returner serverfejl
```

## Skift lærer på course

Gælder for `PUT /courses/:id/teacher`.

```text
Validér course-id med IdDto og teacher_id med TeacherIdDto
Skift læreren via repository
Hvis kurset ikke findes, returner 404
Hent det opdaterede kursus
Returner kurset som JSON
Hvis læreren ikke findes, returner 400
Hvis databasen fejler, returner serverfejl
```

## Tilføj student til course

Gælder for `POST /courses/:id/students`.

```text
Validér course-id med IdDto og student_id med StudentIdDto
Kontrollér at kurset findes
Tilføj studenten til kurset via repository
Returner det opdaterede kursus med status 201
Hvis studenten ikke findes, returner 400
Hvis studenten allerede er på kurset, returner 409
Hvis databasen fejler, returner serverfejl
```

## Fjern student fra course

Gælder for `DELETE /courses/:id/students/:studentId`.

```text
Læs course-id og student-id fra URL
Validér begge id'er med IdDto og Zod
Kontrollér at kurset findes
Fjern studenten fra kurset via repository
Hvis studenten ikke er på kurset, returner 404
Returner det opdaterede kursus som JSON
Hvis databasen fejler, returner serverfejl
```

## Slet course

Gælder for `DELETE /courses/:id`.

```text
Læs id fra URL
Validér id med IdDto og Zod
Slet kurset via repository
Hvis kurset ikke findes, returner 404
Returner status 204 uden indhold
```

## Grades

Gælder for:

- `GET /grades`
- `GET /grades/:letter`

```text
Hent den faste karakterskala fra repository
Returner karaktererne som JSON
Ved opslag på én karakter, validér bogstavet
Grades kan kun læses
Hvis databasen fejler, returner serverfejl
```

## Opret exam

Gælder for `POST /exams`.

```text
Læs course_id, student_id og grade fra request body
Validér request body med ExamDto og Zod
Konvertér multipart-værdier til id'er og stort karakterbogstav
Opret eksamen via repository
Hent den nye eksamen med kursus, student og karakterdetaljer
Returner eksamen med status 201
Hvis kursus, student eller grade ikke findes, returner 400
Hvis studenten ikke er tilmeldt kurset, returner 400
Hvis studenten allerede har en eksamen i kurset, returner 409
Hvis databasen fejler, returner serverfejl
```

## Opdatér exam

Gælder for `PUT /exams/:id`.

```text
Validér id med IdDto og body med ExamDto
Opdatér eksamen via repository
Hvis eksamen ikke findes, returner 404
Kontrollér de samme foreign key-, enrollment- og uniqueness-regler som ved oprettelse
Hent den opdaterede eksamen
Returner eksamen som JSON
Hvis databasen fejler, returner serverfejl
```

## Slet exam

Gælder for `DELETE /exams/:id`.

```text
Validér id med IdDto
Slet eksamen via repository
Hvis eksamen ikke findes, returner 404
Returner status 204 uden indhold
Hvis databasen fejler, returner serverfejl
```
