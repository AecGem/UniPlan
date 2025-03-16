--create degree table
CREATE TABLE degree (
dId SERIAL PRIMARY KEY,
degree VARCHAR(50) NOT NULL,
courses INTEGER[]
);


--create course table
CREATE TABLE course (
cId SERIAL PRIMARY KEY,
shortname VARCHAR(50) NOT NULL,
coursename VARCHAR(255) NOT NULL,
credits INT,
isambig BOOLEAN,
prereq VARCHAR(20)[],
);