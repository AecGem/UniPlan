-- Create table query for User table
CREATE TABLE users (
userId SERIAL PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
fName VARCHAR(50),
lName VARCHAR(50),
pass VARCHAR(50) NOT NULL,
dId INT,
userType BOOL NOT NULL
);
