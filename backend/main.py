from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, utils
from database import SessionLocal, engine
import chardet
from fastapi.responses import JSONResponse
import logging
from utils import process_rirekisho, extract_text_from_pdf
from fastapi.exceptions import RequestValidationError
from datetime import datetime
import base64

models.Base.metadata.create_all(bind=engine)
logging.basicConfig(level=logging.DEBUG)
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
    grade_id: int = Form(...),
    department_id: int = Form(...),
    neuroticism_score: int = Form(...),
    extraversion_score: int = Form(...),
    openness_score: int = Form(...),
    agreeableness_score: int = Form(...),
    conscientiousness_score: int = Form(...),
    password: str = Form(...),
    rirekisho: UploadFile = File(None),
    resume: UploadFile = File(None),
    bigfive: UploadFile = File(None),
    picture: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    try:
        # 日付フィールドの処理
        if isinstance(birthdate, str):
            birthdate = datetime.strptime(birthdate, "%Y-%m-%d").date()
        if isinstance(hire_date, str):
            hire_date = datetime.strptime(hire_date, "%Y-%m-%d").date()

        # ファイル処理と関連フィールドの設定
        career_info_detail = ""
        career_info_vector = []
        personality_detail = ""
        personality_vector = []

        if rirekisho:
            rirekisho_content = await rirekisho.read()
            rirekisho_result = await utils.process_rirekisho_file(rirekisho_content, rirekisho.content_type)
            career_info_detail += f"履歴書情報: {rirekisho_result}\n"

        if resume:
            resume_content = await resume.read()
            resume_result = await utils.process_resume_file(resume_content)
            career_info_detail += f"職務経歴書情報: {resume_result['analysis']}\n"
            career_info_vector = resume_result['vector']

        if bigfive:
            bigfive_content = await bigfive.read()
            bigfive_result = await utils.process_bigfive_file(bigfive_content)
            personality_detail = bigfive_result['detailed_analysis']
            personality_vector = bigfive_result['vector']

        picture_data = await picture.read() if picture else None

        # データベースからgrade_nameとdepartment_nameを取得
        grade = db.query(models.Grade).filter(models.Grade.grade_id == grade_id).first()
        department = db.query(models.Department).filter(models.Department.department_id == department_id).first()

        # 新しい社員データを保存
        new_employee = utils.save_employee_data(
            db=db,
            employee=schemas.EmployeeCreate(
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
                career_info_detail=career_info_detail,
                career_info_vector=career_info_vector,
                personality_detail=personality_detail,
                personality_vector=personality_vector,
                password=password
            ),
            picture=picture_data
        )

        # バイナリデータをbase64エンコードしてレスポンス用に準備
        picture_base64 = base64.b64encode(new_employee.picture).decode('utf-8') if new_employee.picture else None

        # レスポンス用にgrade_nameとdepartment_nameを設定
        return schemas.EmployeeResponse(
            employee_id=new_employee.employee_id,
            employee_name=new_employee.employee_name,
            birthdate=new_employee.birthdate,
            gender=new_employee.gender,
            academic_background=new_employee.academic_background,
            hire_date=new_employee.hire_date,
            recruitment_type=new_employee.recruitment_type,
            grade_name=grade.grade_name if grade else None,
            department_name=department.department_name if department else None,
            neuroticism_score=new_employee.neuroticism_score,
            extraversion_score=new_employee.extraversion_score,
            openness_score=new_employee.openness_score,
            agreeableness_score=new_employee.agreeableness_score,
            conscientiousness_score=new_employee.conscientiousness_score,
            career_info_detail=new_employee.career_info_detail,
            career_info_vector=new_employee.career_info_vector,
            personality_detail=new_employee.personality_detail,
            personality_vector=new_employee.personality_vector,
            picture=picture_base64  # base64エンコードされた画像データを含める
        )

    except Exception as e:
        logging.exception("Error registering employee")
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