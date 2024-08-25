from pydantic import BaseModel
from datetime import date
from typing import List, Optional

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
    career_info_detail: str
    career_info_vector: List[float]
    personality_detail: str
    personality_vector: List[float]
    picture: Optional[bytes] = None
    password: str  # パスワードのハッシュ化はサーバー側で行う

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
    picture: Optional[bytes] = None

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
