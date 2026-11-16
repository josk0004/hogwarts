# Hogwarts API

## Start serveren

Installer dependencies, hvis det ikke allerede er gjort:

```bash
npm install
```

Start derefter serveren:

```bash
npm start
```

Serveren kører som standard på:

```text
http://localhost:3001
```

API'et kræver, at PostgreSQL-databasen `hogwarts` kører lokalt, og at de
nødvendige tabeller findes.

## Endpoints

I routes med `:id` skal `:id` erstattes med det konkrete numeriske id.

### Houses

| Method | Route         | Description    |
| ------ | ------------- | -------------- |
| GET    | `/houses`     | Get all houses |
| GET    | `/houses/:id` | Get one house  |

### Teachers

| Method | Route           | Description      |
| ------ | --------------- | ---------------- |
| GET    | `/teachers`     | Get all teachers |
| GET    | `/teachers/:id` | Get one teacher  |
| POST   | `/teachers`     | Create a teacher |
| PUT    | `/teachers/:id` | Update a teacher |
| DELETE | `/teachers/:id` | Delete a teacher |

### Students

| Method | Route           | Description      |
| ------ | --------------- | ---------------- |
| GET    | `/students`     | Get all students |
| GET    | `/students/:id` | Get one student  |
| POST   | `/students`     | Create a student |
| PUT    | `/students/:id` | Update a student |
| DELETE | `/students/:id` | Delete a student |

### Courses

| Method | Route                              | Description                    |
| ------ | ---------------------------------- | ------------------------------ |
| GET    | `/courses`                         | Get all courses                |
| GET    | `/courses/:id`                     | Get one course                 |
| POST   | `/courses`                         | Create a course                |
| PUT    | `/courses/:id`                     | Update course details          |
| PUT    | `/courses/:id/teacher`             | Change a course teacher        |
| POST   | `/courses/:id/students`            | Add a student to a course      |
| DELETE | `/courses/:id/students/:studentId` | Remove a student from a course |
| DELETE | `/courses/:id`                     | Delete a course                |

### Grades

| Method | Route          | Description       |
| ------ | -------------- | ----------------- |
| GET    | `/grades`      | Get all grades    |
| GET    | `/grades/:letter` | Get one grade  |

Grades are read-only reference data.

### Exams

| Method | Route        | Description      |
| ------ | ------------ | ---------------- |
| GET    | `/exams`     | Get all exams    |
| GET    | `/exams/:id` | Get one exam     |
| POST   | `/exams`     | Create an exam   |
| PUT    | `/exams/:id` | Update an exam   |
| DELETE | `/exams/:id` | Delete an exam   |

## Brug af endpoint-testene

Endpoint-testene ligger i `hogwarts-bruno`
og er lavet til [Bruno](https://www.usebruno.com/).

1. Start PostgreSQL-databasen og API'et med `npm start`.
2. Åbn Bruno.
3. Vælg **Open Collection** og åbn mappen `hogwarts-bruno`.
4. Opret eller vælg et Bruno-environment med variablen:

   ```text
   baseUrl = http://localhost:3001
   ```

5. Åbn en test i den relevante mappe og tryk **Send**.
6. Kontrollér statuskode og response i Bruno.

Testene bruger eksempler på id'er, for eksempel `/houses/1` og
`/courses/4/students`. Hvis databasen har andre id'er, skal id'erne ændres i
den enkelte test, før den sendes.

POST- og PUT-testene indeholder de felter, endpointet forventer, for eksempel:

- teachers: `name`, `house_id`, `employment_start`, `currently_active` og `deceased`
- students: `name`, `house_id`, `birthday` og `school_year`
- courses: `name`, `teacher_id`, `type`, `level` og `school_year`
- exams: `course_id`, `student_id` og `grade`
- ændring af course-teacher: `teacher_id`
- tilføjelse af student til course: `student_id`

`type` er `core`, `elective` eller `extra-curricular`. `level` er `OWL` for
skoleår 1-5 og `NEWT` for skoleår 6-7. `school_year` skal være mellem 1 og 7.
Datoer skal skrives som `YYYY-MM-DD`, og boolean-felter skal være `true` eller
`false`. Felterne er konfigureret som `multipart-form` i Bruno-testene. Brug
derfor samme body-type, hvis en test ændres eller oprettes manuelt.
