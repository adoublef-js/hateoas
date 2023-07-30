DROP TABLE IF EXISTS people;
CREATE TABLE people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age REAL,
    city TEXT
);

INSERT INTO people (name, age, city) VALUES ('Peter Parker', 15, 'nyc');
INSERT INTO people (name, age, city) VALUES ('Mary Jane', 14, 'nyc');