BEGIN;

-- ------------------------------------------------------------
-- Reset (children before parents)
-- ------------------------------------------------------------
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

-- Teachers: many teachers belong to one house
CREATE TABLE teachers (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  house_id INTEGER NOT NULL REFERENCES houses(id)
);

-- Students: many students belong to one house
CREATE TABLE students (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  house_id INTEGER NOT NULL REFERENCES houses(id)
);

-- Courses: each course has one teacher (a teacher can have many courses)
CREATE TABLE courses (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id)
);

-- Join table: many-to-many between courses and students.
-- The composite primary key stops a student being enrolled twice.
-- Deleting a course or a student removes their enrollments automatically.
CREATE TABLE course_students (
  course_id  INTEGER NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, student_id)
);

-- ------------------------------------------------------------
-- Seed data
-- ------------------------------------------------------------

INSERT INTO houses (name) VALUES
  ('Gryffindor'),
  ('Hufflepuff'),
  ('Ravenclaw'),
  ('Slytherin');

INSERT INTO teachers (name, house_id) VALUES
  ('Minerva McGonagall', (SELECT id FROM houses WHERE name = 'Gryffindor')),
  ('Remus Lupin',        (SELECT id FROM houses WHERE name = 'Gryffindor')),
  ('Pomona Sprout',      (SELECT id FROM houses WHERE name = 'Hufflepuff')),
  ('Filius Flitwick',    (SELECT id FROM houses WHERE name = 'Ravenclaw')),
  ('Severus Snape',      (SELECT id FROM houses WHERE name = 'Slytherin')),
  ('Horace Slughorn',    (SELECT id FROM houses WHERE name = 'Slytherin'));

INSERT INTO students (name, house_id) VALUES
  ('Harry Potter',     (SELECT id FROM houses WHERE name = 'Gryffindor')),
  ('Hermione Granger', (SELECT id FROM houses WHERE name = 'Gryffindor')),
  ('Cedric Diggory',   (SELECT id FROM houses WHERE name = 'Hufflepuff')),
  ('Luna Lovegood',    (SELECT id FROM houses WHERE name = 'Ravenclaw')),
  ('Draco Malfoy',     (SELECT id FROM houses WHERE name = 'Slytherin')),
  ('Pansy Parkinson',  (SELECT id FROM houses WHERE name = 'Slytherin'));

INSERT INTO courses (name, teacher_id) VALUES
  ('Transfiguration', (SELECT id FROM teachers WHERE name = 'Minerva McGonagall')),
  ('Potions',         (SELECT id FROM teachers WHERE name = 'Severus Snape')),
  ('Charms',          (SELECT id FROM teachers WHERE name = 'Filius Flitwick'));

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