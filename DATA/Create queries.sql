-- Create degree table
CREATE TABLE degree (
dId SERIAL PRIMARY KEY,
degree VARCHAR(50) NOT NULL,
courses INTEGER[]
);

-- Create course table
CREATE TABLE course (
cId SERIAL PRIMARY KEY,
shortname VARCHAR(50) NOT NULL,
coursename VARCHAR(255),
credits INT NOT NULL,
isambig BOOLEAN NOT NULL,
prereq VARCHAR(20)[],
description VARCHAR(1024),
);

-- Create user table
CREATE TABLE users (
userId SERIAL PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
fName VARCHAR(50),
lName VARCHAR(50),
pass VARCHAR(50) NOT NULL,
dId INT,
userType BOOL NOT NULL
);

-- Create saved semester table
CREATE TABLE saved_sem (
sem_id SERIAL PRIMARY KEY
u_id INT,
CONSTRAINT fk_user FOREIGN KEY (u_id)
REFERENCES users(userId),
courses INTEGER[],
sname VARCHAR(50) NOT NULL
);