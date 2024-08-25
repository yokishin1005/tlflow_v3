from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional
from fastapi import Form

class EmployeeCreate(BaseModel):
    employee_name: str
    birthdate: date
    gender: str
    academic_background: str
    hire_date: date
    recruitment_type: str
    grade_id: int
    department_id: int
    neuroticism_score: int
    extraversion_score: int
    openness_score: int
    agreeableness_score: int
    conscientiousness_score: int
    password: str

    @classmethod
    def as_form(
        cls,
        employee_name: str = Form(...),
        birthdate: date = Form(...),
        gender: str = Form(...),
        academic_background: str = Form(...),
        hire_date: date = Form(...),
        recruitment_type: str = Form(...),
        grade_id: int = Form(...),
        department_id: int = Form(...),
        neuroticism_score: int = Form(...),
        extraversion_score: int = Form(...),
        openness_score: int = Form(...),
        agreeableness_score: int = Form(...),
        conscientiousness_score: int = Form(...),
        password: str = Form(...)
    ):
        return cls(
            employee_name=employee_name,
            birthdate=birthdate,
            gender=gender,
            academic_background=academic_background,
            hire_date=hire_date,
            recruitment_type=recruitment_type,
            grade_id=grade_id,
            department_id=department_id,
            neuroticism_score=neuroticism_score,
            extraversion_score=extraversion_score,
            openness_score=openness_score,
            agreeableness_score=agreeableness_score,
            conscientiousness_score=conscientiousness_score,
            password=password
        )

    class Config:
        orm_mode = True

class EmployeeResponse(BaseModel):
    employee_id: str
    employee_name: str
    birthdate: date
    gender: str
    academic_background: str
    hire_date: date
    recruitment_type: str
    grade_name: str
    department_name: str
    neuroticism_score: int
    extraversion_score: int
    openness_score: int
    agreeableness_score: int
    conscientiousness_score: int
    career_info_detail: str
    career_info_vector: List[float]
    personality_detail: str
    personality_vector: List[float]
    picture: Optional[str] = None

    class Config:
        orm_mode = True

class GradeResponse(BaseModel):
    grade_id: int
    grade_name: str

    class Config:
        orm_mode = True

class DepartmentResponse(BaseModel):
    department_id: int
    department_name: str

    class Config:
        orm_mode = True