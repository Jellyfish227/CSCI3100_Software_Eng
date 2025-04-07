-- init.surql
-- SurrealDB schema for online code learning platform

-- Define the database settings
-- DEFINE DATABASE code_learning_platform;
-- USE NS code_learning_platform;
-- USE DB code_learning_platform;

-- DEFINE TABLES

-- User table with different roles
DEFINE TABLE user SCHEMALESS;
DEFINE FIELD email ON user TYPE string ASSERT string::is::email($value) AND $value != NONE;
DEFINE FIELD password ON user TYPE string ASSERT $value != NONE;
DEFINE FIELD name ON user TYPE string ASSERT $value != NONE;
DEFINE FIELD role ON user TYPE string ASSERT $value INSIDE ["admin", "educator", "student", "moderator"] AND $value != NONE;
DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now();
DEFINE FIELD last_login ON user TYPE datetime DEFAULT NONE;
DEFINE FIELD profile_image ON user TYPE string DEFAULT NONE;
DEFINE FIELD bio ON user TYPE string DEFAULT NONE;
DEFINE INDEX user_email ON user COLUMNS email UNIQUE;

-- Course table
DEFINE TABLE course SCHEMALESS;
DEFINE FIELD title ON course TYPE string ASSERT $value != NONE;
DEFINE FIELD description ON course TYPE string ASSERT $value != NONE;
DEFINE FIELD difficulty ON course TYPE string ASSERT $value INSIDE ["beginner", "intermediate", "advanced"] AND $value != NONE;
DEFINE FIELD tags ON course TYPE array ASSERT $value != NONE;
DEFINE FIELD educator ON course TYPE record<user> ASSERT $value.role == "educator" AND $value != NONE;
DEFINE FIELD created_at ON course TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON course TYPE datetime DEFAULT time::now();
DEFINE FIELD is_published ON course TYPE bool DEFAULT false;
DEFINE FIELD thumbnail ON course TYPE string ASSERT $value != NONE;
DEFINE FIELD duration_hours ON course TYPE float ASSERT $value != NONE;
DEFINE INDEX course_title ON course COLUMNS title;

-- Section table (courses are divided into sections)
DEFINE TABLE section SCHEMALESS;
DEFINE FIELD title ON section TYPE string ASSERT $value != NONE;
DEFINE FIELD description ON section TYPE string ASSERT $value != NONE;
DEFINE FIELD order_index ON section TYPE int ASSERT $value != NONE;
DEFINE FIELD course ON section TYPE record<course> ASSERT $value != NONE;
DEFINE FIELD created_at ON section TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON section TYPE datetime DEFAULT time::now();
DEFINE INDEX section_course_order ON section COLUMNS course, order_index;

-- Materials table (for learning materials)
DEFINE TABLE material SCHEMALESS;
DEFINE FIELD title ON material TYPE string ASSERT $value != NONE;
DEFINE FIELD description ON material TYPE string ASSERT $value != NONE;
DEFINE FIELD type ON material TYPE string ASSERT $value INSIDE ["pdf", "video", "code"] AND $value != NONE;
DEFINE FIELD content_url ON material TYPE string ASSERT $value != NONE;
DEFINE FIELD duration_minutes ON material TYPE int ASSERT $value != NONE;
DEFINE FIELD section ON material TYPE record<section> ASSERT $value != NONE;
DEFINE FIELD order_index ON material TYPE int ASSERT $value != NONE;
DEFINE FIELD created_at ON material TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON material TYPE datetime DEFAULT time::now();
DEFINE INDEX material_section_order ON material COLUMNS section, order_index;

-- Quiz table
DEFINE TABLE quiz SCHEMALESS;
DEFINE FIELD title ON quiz TYPE string ASSERT $value != NONE;
DEFINE FIELD description ON quiz TYPE string ASSERT $value != NONE;
DEFINE FIELD section ON quiz TYPE record<section> ASSERT $value != NONE;
DEFINE FIELD order_index ON quiz TYPE int ASSERT $value != NONE;
DEFINE FIELD passing_score ON quiz TYPE int DEFAULT 60;
DEFINE FIELD time_limit_minutes ON quiz TYPE int DEFAULT 30;
DEFINE FIELD created_at ON quiz TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON quiz TYPE datetime DEFAULT time::now();
DEFINE INDEX quiz_section_order ON quiz COLUMNS section, order_index;

-- Quiz questions
DEFINE TABLE quiz_question SCHEMALESS;
DEFINE FIELD quiz ON quiz_question TYPE record<quiz> ASSERT $value != NONE;
DEFINE FIELD question ON quiz_question TYPE string ASSERT $value != NONE;
DEFINE FIELD type ON quiz_question TYPE string ASSERT $value INSIDE ["multiple_choice", "coding", "true_false"] AND $value != NONE;
DEFINE FIELD options ON quiz_question TYPE array ASSERT $value != NONE;
DEFINE FIELD correct_answer ON quiz_question TYPE string ASSERT $value != NONE;
DEFINE FIELD points ON quiz_question TYPE int ASSERT $value != NONE;
DEFINE FIELD order_index ON quiz_question TYPE int ASSERT $value != NONE;
DEFINE INDEX question_quiz_order ON quiz_question COLUMNS quiz, order_index;

-- Enrollment table (students enrolled in courses)
DEFINE TABLE enrollment SCHEMALESS;
DEFINE FIELD student ON enrollment TYPE record<user> ASSERT $value.role == "student" AND $value != NONE;
DEFINE FIELD course ON enrollment TYPE record<course> ASSERT $value != NONE;
DEFINE FIELD enrolled_at ON enrollment TYPE datetime DEFAULT time::now();
DEFINE FIELD completed ON enrollment TYPE bool DEFAULT false;
DEFINE FIELD completed_at ON enrollment TYPE datetime DEFAULT NONE;
DEFINE FIELD last_accessed_at ON enrollment TYPE datetime DEFAULT NONE;
DEFINE INDEX enrollment_student_course ON enrollment COLUMNS student, course UNIQUE;

-- Student progress tracking
DEFINE TABLE progress SCHEMALESS;
DEFINE FIELD student ON progress TYPE record<user> ASSERT $value.role == "student" AND $value != NONE;
DEFINE FIELD material ON progress TYPE record<material> ASSERT $value != NONE;
DEFINE FIELD started_at ON progress TYPE datetime DEFAULT time::now();
DEFINE FIELD completed ON progress TYPE bool DEFAULT false;
DEFINE FIELD completed_at ON progress TYPE datetime DEFAULT NONE;
DEFINE FIELD progress_percentage ON progress TYPE float DEFAULT 0;
DEFINE INDEX progress_student_material ON progress COLUMNS student, material UNIQUE;

-- Code submissions
DEFINE TABLE code_submission SCHEMALESS;
DEFINE FIELD student ON code_submission TYPE record<user> ASSERT $value.role == "student" AND $value != NONE;
DEFINE FIELD material ON code_submission TYPE record<material> ASSERT $value != NONE;
DEFINE FIELD code ON code_submission TYPE string ASSERT $value != NONE;
DEFINE FIELD language ON code_submission TYPE string ASSERT $value != NONE;
DEFINE FIELD submitted_at ON code_submission TYPE datetime DEFAULT time::now();
DEFINE FIELD status ON code_submission TYPE string ASSERT $value INSIDE ["submitted", "reviewed", "passed", "failed"] AND $value != NONE;
DEFINE FIELD feedback ON code_submission TYPE string DEFAULT NONE;
DEFINE FIELD reviewed_by ON code_submission TYPE record<user> DEFAULT NONE;
DEFINE FIELD reviewed_at ON code_submission TYPE datetime DEFAULT NONE;
DEFINE INDEX submission_student_material ON code_submission COLUMNS student, material;

-- Quiz attempts
DEFINE TABLE quiz_attempt SCHEMALESS;
DEFINE FIELD student ON quiz_attempt TYPE record<user> ASSERT $value.role == "student" AND $value != NONE;
DEFINE FIELD quiz ON quiz_attempt TYPE record<quiz> ASSERT $value != NONE;
DEFINE FIELD started_at ON quiz_attempt TYPE datetime DEFAULT time::now();
DEFINE FIELD submitted_at ON quiz_attempt TYPE datetime;
DEFINE FIELD score ON quiz_attempt TYPE int DEFAULT 0;
DEFINE FIELD passed ON quiz_attempt TYPE bool;
DEFINE FIELD answers ON quiz_attempt TYPE array ASSERT $value != NONE;
DEFINE INDEX attempt_student_quiz ON quiz_attempt COLUMNS student, quiz;

-- Forum categories
DEFINE TABLE forum_category SCHEMALESS;
DEFINE FIELD name ON forum_category TYPE string ASSERT $value != NONE;
DEFINE FIELD description ON forum_category TYPE string ASSERT $value != NONE;
DEFINE FIELD course ON forum_category TYPE record<course> ASSERT $value != NONE;
DEFINE FIELD created_at ON forum_category TYPE datetime DEFAULT time::now();
DEFINE FIELD created_by ON forum_category TYPE record<user> ASSERT $value != NONE;
DEFINE INDEX category_name ON forum_category COLUMNS name;

-- Forum threads
DEFINE TABLE forum_thread SCHEMALESS;
DEFINE FIELD title ON forum_thread TYPE string ASSERT $value != NONE;
DEFINE FIELD content ON forum_thread TYPE string ASSERT $value != NONE;
DEFINE FIELD category ON forum_thread TYPE record<forum_category> ASSERT $value != NONE;
DEFINE FIELD created_at ON forum_thread TYPE datetime DEFAULT time::now();
DEFINE FIELD created_by ON forum_thread TYPE record<user> ASSERT $value != NONE;
DEFINE FIELD is_pinned ON forum_thread TYPE bool DEFAULT false;
DEFINE FIELD is_locked ON forum_thread TYPE bool DEFAULT false;
DEFINE FIELD views ON forum_thread TYPE int DEFAULT 0;
DEFINE INDEX thread_category ON forum_thread COLUMNS category;

-- Forum posts (replies)
DEFINE TABLE forum_post SCHEMALESS;
DEFINE FIELD thread ON forum_post TYPE record<forum_thread> ASSERT $value != NONE;
DEFINE FIELD content ON forum_post TYPE string ASSERT $value != NONE;
DEFINE FIELD created_at ON forum_post TYPE datetime DEFAULT time::now();
DEFINE FIELD created_by ON forum_post TYPE record<user> ASSERT $value != NONE;
DEFINE FIELD updated_at ON forum_post TYPE datetime DEFAULT NONE;
DEFINE FIELD is_solution ON forum_post TYPE bool DEFAULT false;
DEFINE INDEX post_thread ON forum_post COLUMNS thread;

-- Notifications
DEFINE TABLE notification SCHEMALESS;
DEFINE FIELD user ON notification TYPE record<user> ASSERT $value != NONE;
DEFINE FIELD type ON notification TYPE string ASSERT $value INSIDE ["course_update", "forum_reply", "review_complete", "enrollment"] AND $value != NONE;
DEFINE FIELD content ON notification TYPE string ASSERT $value != NONE;
DEFINE FIELD related_record ON notification TYPE record ASSERT $value != NONE;
DEFINE FIELD created_at ON notification TYPE datetime DEFAULT time::now();
DEFINE FIELD read ON notification TYPE bool DEFAULT false;
DEFINE FIELD read_at ON notification TYPE datetime DEFAULT NONE;
DEFINE INDEX notification_user ON notification COLUMNS user;

-- DEFINE PERMISSIONS

-- Admin permissions (can do everything)
DEFINE SCOPE admin SESSION 24h
    SIGNUP ( SELECT * FROM user WHERE role = 'admin' )
    SIGNIN ( SELECT * FROM user WHERE role = 'admin' );

DEFINE SCOPE educator SESSION 24h
    SIGNUP ( SELECT * FROM user WHERE role = 'educator' )
    SIGNIN ( SELECT * FROM user WHERE role = 'educator' );

DEFINE SCOPE student SESSION 24h
    SIGNUP ( SELECT * FROM user WHERE role = 'student' )
    SIGNIN ( SELECT * FROM user WHERE role = 'student' );

DEFINE SCOPE moderator SESSION 24h
    SIGNUP ( SELECT * FROM user WHERE role = 'moderator' )
    SIGNIN ( SELECT * FROM user WHERE role = 'moderator' );

-- User permissions
DEFINE TABLE user PERMISSIONS
    FOR select, update WHERE id = $auth.id OR $auth.role = "admin"
    FOR create, delete WHERE $auth.role = "admin";

-- Course permissions
DEFINE TABLE course PERMISSIONS
    FOR create WHERE $auth.role IN ["admin", "educator"]
    FOR update, delete WHERE $auth.role = "admin" OR (educator = $auth.id AND $auth.role = "educator")
    FOR select WHERE is_published = true OR $auth.role IN ["admin", "educator"] OR educator = $auth.id;

-- Section permissions
DEFINE TABLE section PERMISSIONS
    FOR create, update, delete WHERE $auth.role = "admin" OR 
                                  ($auth.role = "educator" AND course.educator = $auth.id)
    FOR select WHERE course.is_published = true OR 
                    $auth.role = "admin" OR 
                    (course.educator = $auth.id AND $auth.role = "educator");

-- Material permissions
DEFINE TABLE material PERMISSIONS
    FOR create, update, delete WHERE $auth.role = "admin" OR 
                                  ($auth.role = "educator" AND section.course.educator = $auth.id)
    FOR select WHERE section.course.is_published = true OR 
                    $auth.role = "admin" OR 
                    (section.course.educator = $auth.id AND $auth.role = "educator");

-- Forum permissions
DEFINE TABLE forum_category PERMISSIONS
    FOR create, delete WHERE $auth.role IN ["admin", "moderator"]
    FOR update WHERE $auth.role IN ["admin", "moderator"]
    FOR select WHERE true;

DEFINE TABLE forum_thread PERMISSIONS
    FOR create WHERE $auth.id != NULL
    FOR update WHERE created_by = $auth.id OR $auth.role IN ["admin", "moderator"]
    FOR delete WHERE $auth.role IN ["admin", "moderator"]
    FOR select WHERE true;

DEFINE TABLE forum_post PERMISSIONS
    FOR create WHERE $auth.id != NULL AND thread.is_locked = false
    FOR update WHERE created_by = $auth.id OR $auth.role IN ["admin", "moderator"]
    FOR delete WHERE created_by = $auth.id OR $auth.role IN ["admin", "moderator"]
    FOR select WHERE true;

-- Progress tracking permissions
DEFINE TABLE progress PERMISSIONS
    FOR create, update WHERE student = $auth.id OR $auth.role = "admin"
    FOR select WHERE student = $auth.id OR 
                    $auth.role = "admin" OR 
                    (material.section.course.educator = $auth.id AND $auth.role = "educator")
    FOR delete WHERE $auth.role = "admin";

-- Code submission permissions
DEFINE TABLE code_submission PERMISSIONS
    FOR create WHERE student = $auth.id
    FOR update WHERE $auth.role IN ["admin", "educator"] OR 
                    (student = $auth.id AND status = "submitted")
    FOR select WHERE student = $auth.id OR 
                    $auth.role = "admin" OR 
                    (material.section.course.educator = $auth.id AND $auth.role = "educator")
    FOR delete WHERE $auth.role = "admin";

-- Quiz table permissions
DEFINE TABLE quiz PERMISSIONS
    FOR select WHERE section.course.is_published = true OR 
                   $auth.role = "admin" OR 
                   (section.course.educator = $auth.id AND $auth.role = "educator")
    FOR create, update, delete WHERE $auth.role = "admin" OR 
                                  ($auth.role = "educator" AND section.course.educator = $auth.id);

-- Quiz question permissions
DEFINE TABLE quiz_question PERMISSIONS
    FOR select WHERE quiz.section.course.is_published = true OR 
                   $auth.role = "admin" OR 
                   (quiz.section.course.educator = $auth.id AND $auth.role = "educator")
    FOR create, update, delete WHERE $auth.role = "admin" OR 
                                  ($auth.role = "educator" AND quiz.section.course.educator = $auth.id);

-- Quiz attempt permissions
DEFINE TABLE quiz_attempt PERMISSIONS
    FOR create WHERE student = $auth.id
    FOR select WHERE student = $auth.id OR 
                   $auth.role = "admin" OR 
                   (quiz.section.course.educator = $auth.id AND $auth.role = "educator")
    FOR update WHERE $auth.role = "admin" OR 
                    (student = $auth.id AND submitted_at = NONE)
    FOR delete WHERE $auth.role = "admin";

-- Enrollment permissions
DEFINE TABLE enrollment PERMISSIONS
    FOR create WHERE ($auth.role = "student" AND student = $auth.id) OR $auth.role = "admin"
    FOR select WHERE student = $auth.id OR 
                   $auth.role = "admin" OR 
                   (course.educator = $auth.id AND $auth.role = "educator")
    FOR update WHERE $auth.role = "admin" OR 
                   (student = $auth.id AND $auth.role = "student")
    FOR delete WHERE $auth.role = "admin";

-- Notification permissions
DEFINE TABLE notification PERMISSIONS
    FOR select WHERE user = $auth.id OR $auth.role = "admin"
    FOR create WHERE $auth.role = "admin"
    FOR update WHERE user = $auth.id OR $auth.role = "admin"
    FOR delete WHERE user = $auth.id OR $auth.role = "admin";
