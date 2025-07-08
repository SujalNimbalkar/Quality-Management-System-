-- Improved Database Schema for MCQ System
-- This schema normalizes the data and eliminates redundancy

-- 1. EMPLOYEES TABLE
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    hire_date DATE,
    status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) UNIQUE NOT NULL,
    department_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROLES TABLE
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    role_code VARCHAR(20) UNIQUE NOT NULL,
    department_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- 4. SKILLS TABLE
CREATE TABLE skills (
    skill_id INT PRIMARY KEY AUTO_INCREMENT,
    skill_code VARCHAR(20) UNIQUE NOT NULL,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    skill_category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. COMPETENCY_LEVELS TABLE
CREATE TABLE competency_levels (
    level_id INT PRIMARY KEY AUTO_INCREMENT,
    level_code VARCHAR(20) UNIQUE NOT NULL,
    level_name VARCHAR(50) NOT NULL,
    level_number INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ROLE_SKILL_REQUIREMENTS TABLE
CREATE TABLE role_skill_requirements (
    requirement_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    skill_id INT NOT NULL,
    required_level_id INT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id),
    FOREIGN KEY (required_level_id) REFERENCES competency_levels(level_id),
    UNIQUE KEY unique_role_skill (role_id, skill_id)
);

-- 7. EMPLOYEE_ROLES TABLE (Many-to-Many)
CREATE TABLE employee_roles (
    employee_role_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    role_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    UNIQUE KEY unique_employee_role (employee_id, role_id)
);

-- 8. EMPLOYEE_SKILL_ASSESSMENTS TABLE
CREATE TABLE employee_skill_assessments (
    assessment_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    skill_id INT NOT NULL,
    assessed_level_id INT NOT NULL,
    assessment_date DATE NOT NULL,
    assessment_type ENUM('test', 'evaluation', 'certification') NOT NULL,
    assessor_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id),
    FOREIGN KEY (assessed_level_id) REFERENCES competency_levels(level_id),
    FOREIGN KEY (assessor_id) REFERENCES employees(employee_id)
);

-- 9. QUESTIONS TABLE
CREATE TABLE questions (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    question_code VARCHAR(20) UNIQUE NOT NULL,
    skill_id INT NOT NULL,
    level_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'fill_blank') DEFAULT 'multiple_choice',
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id),
    FOREIGN KEY (level_id) REFERENCES competency_levels(level_id)
);

-- 10. QUESTION_OPTIONS TABLE
CREATE TABLE question_options (
    option_id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    option_letter CHAR(1) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
);

-- 11. TESTS TABLE
CREATE TABLE tests (
    test_id INT PRIMARY KEY AUTO_INCREMENT,
    test_code VARCHAR(20) UNIQUE NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INT DEFAULT 60,
    passing_score DECIMAL(5,2) DEFAULT 70.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. TEST_QUESTIONS TABLE
CREATE TABLE test_questions (
    test_question_id INT PRIMARY KEY AUTO_INCREMENT,
    test_id INT NOT NULL,
    question_id INT NOT NULL,
    question_order INT NOT NULL,
    points DECIMAL(5,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(test_id),
    FOREIGN KEY (question_id) REFERENCES questions(question_id),
    UNIQUE KEY unique_test_question (test_id, question_id)
);

-- 13. TEST_ASSIGNMENTS TABLE
CREATE TABLE test_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    test_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    status ENUM('assigned', 'in_progress', 'completed', 'expired') DEFAULT 'assigned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (test_id) REFERENCES tests(test_id),
    FOREIGN KEY (assigned_by) REFERENCES employees(employee_id)
);

-- 14. TEST_RESULTS TABLE
CREATE TABLE test_results (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    employee_id INT NOT NULL,
    test_id INT NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    status ENUM('passed', 'failed', 'incomplete') DEFAULT 'incomplete',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES test_assignments(assignment_id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (test_id) REFERENCES tests(test_id)
);

-- 15. TEST_ANSWERS TABLE
CREATE TABLE test_answers (
    answer_id INT PRIMARY KEY AUTO_INCREMENT,
    result_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option_id INT,
    is_correct BOOLEAN,
    time_taken_seconds INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (result_id) REFERENCES test_results(result_id),
    FOREIGN KEY (question_id) REFERENCES questions(question_id),
    FOREIGN KEY (selected_option_id) REFERENCES question_options(option_id)
);

-- Indexes for better performance
CREATE INDEX idx_employee_email ON employees(email);
CREATE INDEX idx_employee_status ON employees(status);
CREATE INDEX idx_role_department ON roles(department_id);
CREATE INDEX idx_requirement_role ON role_skill_requirements(role_id);
CREATE INDEX idx_requirement_skill ON role_skill_requirements(skill_id);
CREATE INDEX idx_assessment_employee ON employee_skill_assessments(employee_id);
CREATE INDEX idx_assessment_skill ON employee_skill_assessments(skill_id);
CREATE INDEX idx_question_skill_level ON questions(skill_id, level_id);
CREATE INDEX idx_test_assignment_employee ON test_assignments(employee_id);
CREATE INDEX idx_test_assignment_status ON test_assignments(status);
CREATE INDEX idx_test_result_employee ON test_results(employee_id);
CREATE INDEX idx_test_result_status ON test_results(status); 