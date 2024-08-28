from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, utils
from database import SessionLocal, engine
from fastapi.responses import JSONResponse
import logging
from fastapi.exceptions import RequestValidationError
from datetime import datetime
import base64
import uvicorn

models.Base.metadata.create_all(bind=engine)
logging.basicConfig(level=logging.INFO)
app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    employee_data: schemas.EmployeeCreate = Depends(schemas.EmployeeCreate.as_form),
    resume: UploadFile = File(None),
    bigfive: UploadFile = File(None),
    picture: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    try:
        # Date parsing (if not handled in EmployeeCreate schema)
        employee_data.birthdate = datetime.strptime(employee_data.birthdate, "%Y-%m-%d").date()
        employee_data.hire_date = datetime.strptime(employee_data.hire_date, "%Y-%m-%d").date()

        # File processing
        career_info_detail, career_info_vector = await utils.process_career_files(resume)
        personality_detail, personality_vector = await utils.process_personality_file(bigfive)
        picture_data = await picture.read() if picture else None

        # Fetch grade and department information
        grade = db.query(models.Grade).filter(models.Grade.grade_id == employee_data.grade_id).first()
        department = db.query(models.Department).filter(models.Department.department_id == employee_data.department_id).first()

        # Save new employee data
        new_employee = utils.save_employee_data(
            db=db,
            employee=employee_data,
            career_info_detail=career_info_detail,
            career_info_vector=career_info_vector,
            personality_detail=personality_detail,
            personality_vector=personality_vector,
            picture=picture_data
        )

        # Prepare response
        picture_base64 = base64.b64encode(new_employee.picture).decode('utf-8') if new_employee.picture else None

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
            picture=picture_base64
        )

    except HTTPException as http_err:
        logging.error(f"HTTP error occurred: {http_err.detail}")
        raise http_err
    except Exception as e:
        logging.exception("Unexpected error occurred while registering employee")
        raise HTTPException(status_code=500, detail=f"Error registering employee: {str(e)}")
    
@app.post("/process_resume/", response_model=dict)
async def process_resume_endpoint(file: UploadFile):
    return await utils.process_resume_file(file)

@app.post("/process_bigfive/", response_model=dict)
async def process_bigfive_endpoint(file: UploadFile = File(...)):
    try:
        return await utils.process_bigfive_file(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@app.get("/grades/", response_model=List[schemas.GradeResponse])
async def get_grades(db: Session = Depends(get_db)):
    return utils.get_grades(db)

@app.get("/departments/", response_model=List[schemas.DepartmentResponse])
async def get_departments(db: Session = Depends(get_db)):
    return utils.get_departments(db)

@app.get("/jobposts/", response_model=List[schemas.JobPostResponse])
async def get_jobposts(db: Session = Depends(get_db)):
    return utils.get_jobposts(db)

@app.get("/departments/{department_id}/jobposts/", response_model=List[schemas.JobPostResponse])
async def get_jobposts_by_department(department_id: int, db: Session = Depends(get_db)):
    jobposts = utils.get_jobposts_by_department(db, department_id)
    if not jobposts:
        raise HTTPException(status_code=404, detail="No job posts found for this department")
    return jobposts

@app.get("/employees/", response_model=List[schemas.EmployeeResponse])
async def get_employees(db: Session = Depends(get_db)):
    return utils.get_employees(db)

@app.get("/employees/{employee_id}", response_model=schemas.EmployeeResponse)
async def get_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = utils.get_employee_by_id(db, employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return utils.create_employee_response(employee, db)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)