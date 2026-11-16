-- ============================================================
-- Hogwarts database: houses, teachers, students, courses, grades, exams
--
-- HOW TO USE
-- 1. Create an empty database first (e.g. named "hogwarts"):
--      CREATE DATABASE hogwarts;
-- 2. Connect to that database (in pgAdmin 4: right-click the
--    database -> Query Tool).
-- 3. Run this whole file.
--
-- The script can be re-run safely: it drops the tables first
-- and recreates them, so any existing data in them is lost.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Reset (children before parents)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS course_students;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS houses;

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

-- Houses: just a name
CREATE TABLE houses (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Teachers: many teachers belong to one house.
-- "Cannot be active before employment start" is checked in the API,
-- because a CHECK against today's date would break when restoring old dumps.
CREATE TABLE teachers (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  house_id         INTEGER NOT NULL REFERENCES houses(id),
  employment_start DATE    NOT NULL,
  currently_active BOOLEAN NOT NULL DEFAULT TRUE,
  deceased         BOOLEAN NOT NULL DEFAULT FALSE
);

-- Students: many students belong to one house.
-- school_year is independent of birthday (repeaters, leave, early starters).
CREATE TABLE students (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  house_id    INTEGER NOT NULL REFERENCES houses(id),
  birthday    DATE     NOT NULL,
  school_year SMALLINT NOT NULL CHECK (school_year BETWEEN 1 AND 7)
);

-- Courses: each course has one teacher (a teacher can have many courses).
-- OWL = years 1-5, NEWT = years 6-7.
CREATE TABLE courses (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  teacher_id  INTEGER NOT NULL REFERENCES teachers(id),
  type        VARCHAR(20) NOT NULL
              CHECK (type IN ('core', 'elective', 'extra-curricular')),
  level       VARCHAR(4)  NOT NULL
              CHECK (level IN ('OWL', 'NEWT')),
  school_year SMALLINT    NOT NULL
              CHECK (school_year BETWEEN 1 AND 7),
  CONSTRAINT courses_level_matches_year CHECK (
    (level = 'OWL'  AND school_year <= 5) OR
    (level = 'NEWT' AND school_year >= 6)
  )
);

-- Join table: many-to-many between courses and students.
-- The composite primary key stops a student being enrolled twice.
-- Deleting a course or a student removes their enrollments automatically.
CREATE TABLE course_students (
  course_id  INTEGER NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, student_id)
);

-- Grades: the fixed Hogwarts grading scale (read-only reference data).
-- Seeded below and then locked with triggers, so it cannot be changed.
CREATE TABLE grades (
  letter      CHAR(1) PRIMARY KEY,
  name        VARCHAR(30) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  result      VARCHAR(4) NOT NULL CHECK (result IN ('pass', 'fail'))
);

-- Exams: one grade per student per course.
-- The composite foreign key means a grade can only exist for a student who
-- is enrolled in the course. Removing the enrollment (or the student or the
-- course) removes the grade too.
CREATE TABLE exams (
  id         SERIAL PRIMARY KEY,
  course_id  INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  grade      CHAR(1) NOT NULL,
  CONSTRAINT exams_one_grade_per_student_course UNIQUE (course_id, student_id),
  CONSTRAINT exams_enrollment_fk FOREIGN KEY (course_id, student_id)
    REFERENCES course_students (course_id, student_id) ON DELETE CASCADE,
  CONSTRAINT exams_grade_fk FOREIGN KEY (grade) REFERENCES grades (letter)
);

-- ------------------------------------------------------------
-- Seed data
-- ------------------------------------------------------------

INSERT INTO houses (name) VALUES
  ('Gryffindor'),
  ('Hufflepuff'),
  ('Ravenclaw'),
  ('Slytherin');

INSERT INTO teachers (name, house_id, employment_start, currently_active, deceased) VALUES
  ('Minerva McGonagall', (SELECT id FROM houses WHERE name = 'Gryffindor'), '1956-09-01', TRUE,  FALSE),
  ('Remus Lupin',        (SELECT id FROM houses WHERE name = 'Gryffindor'), '1993-09-01', FALSE, TRUE),
  ('Pomona Sprout',      (SELECT id FROM houses WHERE name = 'Hufflepuff'), '1971-09-01', TRUE,  FALSE),
  ('Filius Flitwick',    (SELECT id FROM houses WHERE name = 'Ravenclaw'),  '1975-09-01', TRUE,  FALSE),
  ('Severus Snape',      (SELECT id FROM houses WHERE name = 'Slytherin'),  '1981-09-01', FALSE, TRUE),
  ('Horace Slughorn',    (SELECT id FROM houses WHERE name = 'Slytherin'),  '1938-09-01', TRUE,  FALSE);

INSERT INTO students (name, house_id, birthday, school_year) VALUES
  ('Harry Potter',     (SELECT id FROM houses WHERE name = 'Gryffindor'), '1980-07-31', 5),
  ('Hermione Granger', (SELECT id FROM houses WHERE name = 'Gryffindor'), '1979-09-19', 5),
  ('Cedric Diggory',   (SELECT id FROM houses WHERE name = 'Hufflepuff'), '1977-10-01', 5),
  ('Luna Lovegood',    (SELECT id FROM houses WHERE name = 'Ravenclaw'),  '1981-02-13', 4),
  ('Draco Malfoy',     (SELECT id FROM houses WHERE name = 'Slytherin'),  '1980-06-05', 5),
  ('Pansy Parkinson',  (SELECT id FROM houses WHERE name = 'Slytherin'),  '1980-08-21', 5);

INSERT INTO courses (name, teacher_id, type, level, school_year) VALUES
  ('Transfiguration', (SELECT id FROM teachers WHERE name = 'Minerva McGonagall'), 'core', 'OWL', 5),
  ('Potions',         (SELECT id FROM teachers WHERE name = 'Severus Snape'),      'core', 'OWL', 5),
  ('Charms',          (SELECT id FROM teachers WHERE name = 'Filius Flitwick'),    'core', 'OWL', 4);

INSERT INTO course_students (course_id, student_id)
SELECT c.id, s.id
FROM courses c, students s
WHERE (c.name, s.name) IN (
  ('Transfiguration', 'Harry Potter'),
  ('Transfiguration', 'Hermione Granger'),
  ('Transfiguration', 'Cedric Diggory'),
  ('Potions',         'Harry Potter'),
  ('Potions',         'Hermione Granger'),
  ('Potions',         'Draco Malfoy'),
  ('Charms',          'Luna Lovegood'),
  ('Charms',          'Hermione Granger')
);

INSERT INTO grades (letter, name, description, result) VALUES
  ('O', 'Outstanding',          'The top grade. Shows exceptional skill and a thorough command of the subject.', 'pass'),
  ('E', 'Exceeds Expectations', 'A very good result, above what is required to pass.', 'pass'),
  ('A', 'Acceptable',           'Meets the standard to pass and shows real magical potential.', 'pass'),
  ('P', 'Poor',                 'A narrow fail. The result may have been affected by circumstances outside the student''s control.', 'fail'),
  ('D', 'Dreadful',             'A clear fail.', 'fail'),
  ('T', 'Troll',                'The lowest grade: a complete fail, or an exam abandoned because of circumstances outside the student''s control.', 'fail');

-- Lock the grading scale: any insert, update, delete or truncate is rejected.
-- (Created after the seed above so the seed itself is allowed.)
CREATE OR REPLACE FUNCTION grades_read_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'The grades table is read-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grades_no_row_changes
  BEFORE INSERT OR UPDATE OR DELETE ON grades
  FOR EACH ROW EXECUTE FUNCTION grades_read_only();

CREATE TRIGGER grades_no_truncate
  BEFORE TRUNCATE ON grades
  FOR EACH STATEMENT EXECUTE FUNCTION grades_read_only();

INSERT INTO exams (course_id, student_id, grade)
SELECT c.id, s.id, x.grade
FROM (VALUES
  ('Transfiguration', 'Harry Potter',     'E'),
  ('Transfiguration', 'Hermione Granger', 'O'),
  ('Transfiguration', 'Cedric Diggory',   'P'),
  ('Potions',         'Harry Potter',     'E'),
  ('Potions',         'Hermione Granger', 'O'),
  ('Potions',         'Draco Malfoy',     'A'),
  ('Charms',          'Luna Lovegood',    'O'),
  ('Charms',          'Hermione Granger', 'E')
) AS x(course, student, grade)
JOIN courses  c ON c.name = x.course
JOIN students s ON s.name = x.student;

COMMIT;

-- ------------------------------------------------------------
-- Quick check (optional): should return 8 rows
-- ------------------------------------------------------------
SELECT c.name AS course, t.name AS teacher, s.name AS student
FROM courses c
JOIN teachers t ON t.id = c.teacher_id
JOIN course_students cs ON cs.course_id = c.id
JOIN students s ON s.id = cs.student_id
ORDER BY c.id, s.id;