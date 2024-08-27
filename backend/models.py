from sqlalchemy import Column, Integer, String, Date, LargeBinary, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class Grade(Base):
    __tablename__ = "grade"

    grade_id = Column(Integer, primary_key=True, index=True)
    grade_name = Column(String, nullable=False)

    employees = relationship("EmployeeGrade", back_populates="grade")

class EmployeeGrade(Base):
    __tablename__ = "employee_grade"

    employeegrade_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employee.employee_id"), nullable=False)
    grade_id = Column(Integer, ForeignKey("grade.grade_id"), nullable=False)

    employee = relationship("Employee", back_populates="grades")
    grade = relationship("Grade", back_populates="employees")

class Employee(Base):
    __tablename__ = 'employee'

    employee_id = Column(String, primary_key=True)
    employee_name = Column(String, nullable=False)
    birthdate = Column(Date, nullable=False)
    gender = Column(String, nullable=False)
    academic_background = Column(String, nullable=False)
    hire_date = Column(Date, nullable=False)
    recruitment_type = Column(String, nullable=False)
    picture = Column(LargeBinary)
    career_info_detail = Column(String, nullable=False)
    career_info_vector = Column(JSON, nullable=False)
    personality_detail = Column(String, nullable=False)
    personality_vector = Column(JSON, nullable=False)
    neuroticism_score = Column(Integer, nullable=False)
    extraversion_score = Column(Integer, nullable=False)
    openness_score = Column(Integer, nullable=False)
    agreeableness_score = Column(Integer, nullable=False)
    conscientiousness_score = Column(Integer, nullable=False)
    password_hash = Column(String, nullable=False)

    grades = relationship("EmployeeGrade", back_populates="employee")
    departments = relationship("DepartmentMember", back_populates="employee")

class Department(Base):
    __tablename__ = "department"

    department_id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String, nullable=False)
    department_detail = Column(String, nullable=False)

    employees = relationship("DepartmentMember", back_populates="department")
    job_posts = relationship("JobPost", back_populates="department")

class DepartmentMember(Base):
    __tablename__ = "department_member"

    departmentmember_id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("department.department_id"), nullable=False)
    employee_id = Column(String, ForeignKey("employee.employee_id"), nullable=False)

    department = relationship("Department", back_populates="employees")
    employee = relationship("Employee", back_populates="departments")

class JobPost(Base):
    __tablename__ = "job_post"
    jobpost_id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("department.department_id"), nullable=False)
    job_title = Column(String, nullable=False)
    job_detail = Column(String, nullable=False)
    job_detail_vector = Column(JSON, nullable=False)

    department = relationship("Department", back_populates="job_posts")