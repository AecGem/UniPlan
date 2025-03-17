--course creation query
INSERT INTO course (shortname, coursename, credits, isambig, prereq, description) VALUES ('SHORTNAME', 'COURSENAME' ,CREDITS, ISAMBIG, 'PREREQ', 'DESCR');
--degree creation query
INSERT INTO degree (degree, courses) VALUES ('DEGREE', '{COURSES}'); 
