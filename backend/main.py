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
    rirekisho: UploadFile = File(None),
    resume: UploadFile = File(None),
    bigfive: UploadFile = File(None),
    picture: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    try:
        # ファイル処理
        career_info_detail, career_info_vector = await utils.process_career_files(rirekisho, resume)
        personality_detail, personality_vector = await utils.process_personality_file(bigfive)
        picture_data = await picture.read() if picture else None

        # 新しい社員データを保存
        new_employee = utils.save_employee_data(
            db=db,
            employee=employee_data,
            career_info_detail=career_info_detail,
            career_info_vector=career_info_vector,
            personality_detail=personality_detail,
            personality_vector=personality_vector,
            picture=picture_data
        )

        return utils.create_employee_response(new_employee, db)

    except HTTPException as http_err:
        logging.error(f"HTTP error occurred: {http_err.detail}")
        raise http_err
    except Exception as e:
        logging.exception("Unexpected error occurred while registering employee")
        raise HTTPException(status_code=500, detail="Error registering employee")

@app.post("/process_rirekisho/", response_model=dict)
async def process_rirekisho_endpoint(file: UploadFile = File(...)):
    try:
        return await utils.process_rirekisho_file(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@app.post("/process_resume/", response_model=dict)
async def process_resume_endpoint(file: UploadFile = File(...)):
    try:
        return await utils.process_resume_file(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

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