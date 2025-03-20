-- Add new user query, fill in variables for caps values:
INSERT INTO users (email, fName, lName, pass, usertype, hasSaved) 
VALUES (EMAIL_IN, FNAME_IN, LNAME_IN, crypt(PASS_IN, gen_salt('md5')), TYPE_IN, false); 

-- Update user table with selected degree
UPDATE users 
SET did = "DID_IN" 
WHERE userid = "USERID_IN";

-- Login query, replace EMAIL_IN with variable for email. 
-- Once a user is logged in, userId should be stored so it can be used to query the db
SELECT pass, userId, usertype 
FROM users 
WHERE email = EMAIL_IN;

-- Update user info query, replace SAVED_userId with variable storing the userId:
UPDATE users 
SET email = EMAIL_IN fName = FNAME_IN, lName = LNAME_IN, pass = PASS_IN 
WHERE userId = SAVED_userId;

-- degree selection query, DID_IN should be replaced with the degree ID from the degree table
-- The degree table should be queried first, and the degree id retrieved from it, then it can be stored in the user table
UPDATE users 
SET dId = DID_IN 
WHERE userId = userId_IN;

-- Course creation query
INSERT INTO course (shortname, coursename, credits, isambig, prereq, description) 
VALUES ('SHORTNAME', 'COURSENAME', CREDITS, ISAMBIG, 'PREREQ', 'DESCR');

-- Degree creation query
INSERT INTO degree (degree, courses) 
VALUES ('DEGREE', '{COURSES}'); 

-- Return degrees
SELECT did, degree FROM degree;

-- Get degree requirements
SELECT req FROM degree 
WHERE did = "DID_IN";