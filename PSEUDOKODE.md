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

```text
Læs id fra URL
Kontrollér at id er et helt tal
Hent objektet fra repository
Hvis objektet ikke findes, returner 404
Ellers returner objektet som JSON
Hvis databasen fejler, returner serverfejl
```

## Opret teacher eller student

Gælder for:

- `POST /teachers`
- `POST /students`

```text
Læs name og house_id fra request body
Kontrollér at name findes
Kontrollér at house_id er et helt tal
Opret personen via repository
Hent den nye person
Returner personen med status 201
Hvis huset ikke findes, returner 400
Hvis databasen fejler, returner serverfejl
```

## Opdatér teacher eller student

Gælder for:

- `PUT /teachers/:id`
- `PUT /students/:id`

```text
Læs id fra URL
Kontrollér at id er et helt tal
Læs name og house_id fra request body
Kontrollér input
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
Kontrollér at id er et helt tal
Slet personen via repository
Hvis personen ikke findes, returner 404
Returner status 204 uden indhold
Hvis databasen fejler, returner serverfejl
```

## Opret course

Gælder for `POST /courses`.

```text
Læs name og teacher_id fra request body
Kontrollér at name findes
Kontrollér at teacher_id er et helt tal
Opret kurset via repository
Hent det nye kursus med lærer og studerende
Returner kurset med status 201
Hvis læreren ikke findes, returner 400
Hvis databasen fejler, returner serverfejl
```

## Opdatér course-navn

Gælder for `PUT /courses/:id`.

```text
Læs id fra URL og name fra request body
Kontrollér id og name
Opdatér kursusnavnet via repository
Hvis kurset ikke findes, returner 404
Hent det opdaterede kursus
Returner kurset som JSON
Hvis databasen fejler, returner serverfejl
```

## Skift lærer på course

Gælder for `PUT /courses/:id/teacher`.

```text
Læs course-id fra URL og teacher_id fra request body
Kontrollér at begge id'er er hele tal
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
Læs course-id fra URL og student_id fra request body
Kontrollér at begge id'er er hele tal
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
Kontrollér at begge id'er er hele tal
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
Kontrollér at id er et helt tal
Slet kurset via repository
Hvis kurset ikke findes, returner 404
Returner status 204 uden indhold
Hvis databasen fejler, returner serverfejl
```
