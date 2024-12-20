-- First delete course_access records since they reference course_purchases
DELETE FROM course_access;

-- Then delete course_purchases records
DELETE FROM course_purchases;
