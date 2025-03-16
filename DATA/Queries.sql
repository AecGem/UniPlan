-- Return degrees
SELECT did, degree from degree;

-- Update user table with selected degree
UPDATE users SET did = "DID_IN" WHERE userid = "USERID_IN";

-- Get degree requirements
SELECT req from degree WHERE did = "DID_IN";