from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List,Optional
import models, schemas, utils
from database import SessionLocal, engine
import chardet
from fastapi.responses import JSONResponse
import logging
from utils import process_rirekisho, extract_text_from_pdf
from fastapi.exceptions import RequestValidationError


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # フロントエンドのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データベースセッションを取得するための依存関係
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )
        
@app.post("/employees/", response_model=schemas.EmployeeResponse)
async def register_employee(
    employee_name: str = Form(...),
    birthdate: str = Form(...),
    gender: str = Form(...),
    academic_background: str = Form(...),
    hire_date: str = Form(...),
    recruitment_type: str = Form(...),
    grade_name: str = Form(...),
    department_name: str = Form(...),
    neuroticism_score: int = Form(...),
    extraversion_score: int = Form(...),
    openness_score: int = Form(...),
    agreeableness_score: int = Form(...),
    conscientiousness_score: int = Form(...),
    password: str = Form(...),
    rirekisho: Optional[UploadFile] = File(None),
    resume: Optional[UploadFile] = File(None),
    bigfive: Optional[UploadFile] = File(None),
    picture: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        # 受け取ったデータを適切に保存
        picture_data = await picture.read() if picture else None
        new_employee = utils.save_employee_data(
            db=db, 
            employee_name=employee_name,
            birthdate=birthdate,
            gender=gender,
            academic_background=academic_background,
            hire_date=hire_date,
            recruitment_type=recruitment_type,
            grade_name=grade_name,
            department_name=department_name,
            neuroticism_score=neuroticism_score,
            extraversion_score=extraversion_score,
            openness_score=openness_score,
            agreeableness_score=agreeableness_score,
            conscientiousness_score=conscientiousness_score,
            password=password,
            rirekisho=rirekisho,
            resume=resume,
            bigfive=bigfive,
            picture=picture_data
        )
        return new_employee
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error registering employee: {str(e)}")



@app.post("/process_rirekisho/", response_model=dict)
async def process_rirekisho_endpoint(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        return await utils.process_rirekisho_file(contents, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@app.post("/process_resume/", response_model=dict)
async def process_resume_endpoint(file: UploadFile = File(...)):
    contents = await file.read()
    return await utils.process_resume_file(contents)

@app.post("/process_bigfive/", response_model=dict)
async def process_bigfive_endpoint(file: UploadFile = File(...)):
    contents = await file.read()
    return await utils.process_bigfive_file(contents)

@app.get("/grades/", response_model=List[schemas.GradeResponse])
async def get_grades(db: Session = Depends(get_db)):
    return utils.get_grades(db)

@app.get("/departments/", response_model=List[schemas.DepartmentResponse])
async def get_departments(db: Session = Depends(get_db)):
    return utils.get_departments(db)

@app.get("/employees/", response_model=List[schemas.EmployeeResponse])
async def get_employees(db: Session = Depends(get_db)):
    return utils.get_employees(db)

@app.get("/employees/{employee_id}", response_model=schemas.EmployeeResponse)
async def get_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = utils.get_employee_by_id(db, employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee