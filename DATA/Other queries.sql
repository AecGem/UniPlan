-- In all query templates, replace CAPS variables with applicable data

-- Add new user query
INSERT INTO users (email, fName, lName, pass, usertype, hasSaved) 
VALUES ('EMAIL_IN', 'FNAME_IN', 'LNAME_IN', crypt('PASS_IN', gen_salt('md5')), TYPE_IN, false); 

-- Update user table with selected degree
UPDATE users 
SET did = "DID_IN" 
WHERE userid = "USERID_IN";

-- Login query. Once a user is logged in, userId should be stored so it can be used to query the db
SELECT pass, userId, usertype 
FROM users 
WHERE email = 'EMAIL_IN';

-- Change password query, replace SAVED_userId with variable storing the userId:
UPDATE users 
SET pass = 'PASS_IN'
WHERE userId = SAVED_userId;

-- Update user info query, replace SAVED_userId with variable storing the userId:
UPDATE users 
SET email = 'EMAIL_IN', fName = 'FNAME_IN', lName = 'LNAME_IN', pass = 'PASS_IN' 
WHERE userId = SAVED_userId;

-- degree selection query, DID_IN should be replaced with the degree ID from the degree table
-- The degree table should be queried first, and the degree id retrieved from it, then it can be stored in the user table
UPDATE users 
SET dId = DID_IN 
WHERE userId = userId_IN;

-- Get degree requirements, replace DID_IN with degree ID from degree table
SELECT req FROM degree 
WHERE did = DID_IN;

-- Create new course
INSERT INTO course (shortname, coursename, credits, isambig, prereq, description) 
VALUES ('SHORTNAME', 'COURSENAME', CREDITS, ISAMBIG, 'PREREQ', 'DESCR');

-- Create new degree
INSERT INTO degree (degree, courses) 
VALUES ('DEGREE', '{COURSES}'); 

-- Return all degrees
SELECT did, degree FROM degree;

-- Save semester
INSERT INTO saved_sem (u_id, courses, sname)
VALUES (userId_IN, '{COURSES}', 'SNAME_IN');

-- Open saved plan
SELECT * FROM saved_sem 
WHERE u_id = USERID_IN
ORDER BY cID asc;

-- View degree statistics
SELECT COUNT(userId) FROM users
WHERE dId = DID_IN; 

-- View course statistics
SELECT COUNT(u_id) FROM saved_sem 
WHERE CID_IN = ANY(courses);