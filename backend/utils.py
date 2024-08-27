import chardet
from openai import OpenAI
from typing import Dict, Any, Tuple, Optional
from io import BytesIO
import json
from fastapi import HTTPException, UploadFile
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams
from sqlalchemy.orm import Session
import datetime
from models import Employee, EmployeeGrade, Grade, Department, DepartmentMember, JobPost
from schemas import EmployeeCreate, EmployeeResponse
import logging
import bcrypt
import base64

client = OpenAI()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

async def process_rirekisho_file(file: UploadFile) -> Dict[str, Any]:
    contents = await file.read()
    if file.content_type == "application/pdf":
        text = extract_text_from_pdf(contents)
    else:
        encoding = chardet.detect(contents)['encoding'] or 'utf-8'
        text = contents.decode(encoding)

    return process_rirekisho(text)

def extract_text_from_pdf(contents: bytes) -> str:
    output_string = BytesIO()
    laparams = LAParams()
    extract_text_to_fp(BytesIO(contents), output_string, laparams=laparams)
    return output_string.getvalue().decode()

def process_rirekisho(text: str) -> Dict[str, Any]:
    prompt = f"""
    以下の履歴書から以下の情報を抽出してください:
    名前 (Name)
    生年月日 (Birthdate) (利用可能な場合)
    性別 (Gender) (利用可能な場合)
    学歴 (Academic Background)
    経歴 (Career Information)
    
    履歴書:
    {text}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは経験豊富な履歴書解析アシスタントです。"},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
    )

    extracted_info = response.choices[0].message.content.strip()

    info_dict = {}
    for line in extracted_info.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            info_dict[key.strip().lower().replace(' ', '_')] = value.strip()

    return info_dict

async def process_resume_file(file: UploadFile) -> Dict[str, Any]:
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    return process_resume(text)

def process_resume(text: str) -> Dict[str, Any]:
    prompt = f"""
    以下職務経歴書の内容を詳細に分析し、候補者の職務経歴と強みについて、以下のカテゴリーに分けて日本語で説明してください：

    1. 専門的スキル：職種や業界に特化した技術的なスキルや知識
    2. 一般的スキル：様々な職種や状況で活用できる汎用的なスキルや能力
    3. 主な職務内容：これまでの経歴における主要な責任と成果
    4. 強み：候補者の際立った特徴や、他の候補者と差別化できる点

    それぞれのカテゴリーについて、具体的な例や状況を挙げて詳しく説明してください。

    職務経歴書:
    {text}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは経験豊富なキャリアコンサルタントです。書類を詳細に分析し、候補者の強みを的確に言語化することができます。"},
            {"role": "user", "content": prompt}
        ],
        max_tokens=2000,
    )

    analysis = response.choices[0].message.content.strip()
    embedding = get_embedding(analysis)

    return {
        "analysis": analysis,
        "vector": embedding
    }

async def process_bigfive_file(file: UploadFile) -> Dict[str, Any]:
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    return process_bigfive(text)

def process_bigfive(text: str) -> Dict[str, Any]:
    prompt = f"""
    以下のBigFive性格検査の結果を詳細に分析し、その人の性格特性から読み取ることのできる以下の点について、日本語で具体的に説明してください：

    1. その人固有の強み
    2. その人らしさ
    3. 行動特性
    4. 価値観
    5. キャリア適性
    6. チーム内での役割

    それぞれの項目について、できるだけ具体的な例や状況を挙げて説明してください。また、ビジネス場面での活用方法や自己成長のためのアドバイスも含めてください。

    BigFive性格検査結果:
    {text}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは経験豊富な人事コンサルタントです。BigFive性格検査の結果から人物の特徴を深く洞察し、キャリア開発やチーム編成に活用できる情報を提供することができます。"},
            {"role": "user", "content": prompt}
        ],
        max_tokens=2000,
    )

    analysis = response.choices[0].message.content.strip()
    embedding = get_embedding(analysis)

    return {
        "detailed_analysis": analysis,
        "vector": embedding
    }

def get_embedding(text: str, model: str = "text-embedding-3-small") -> list[float]:
    text = text.replace("\n", " ")
    return client.embeddings.create(input=[text], model=model).data[0].embedding

async def process_career_files(rirekisho: UploadFile, resume: UploadFile) -> Tuple[str, list[float]]:
    rirekisho_info = await process_rirekisho_file(rirekisho) if rirekisho else {}
    resume_info = await process_resume_file(resume) if resume else {}
    
    career_info_detail = f"履歴書情報: {json.dumps(rirekisho_info, ensure_ascii=False)}\n"
    career_info_detail += f"職務経歴書情報: {resume_info.get('analysis', '')}"
    
    career_info_vector = resume_info.get('vector', [])
    
    return career_info_detail, career_info_vector

async def process_personality_file(bigfive: UploadFile) -> Tuple[str, list[float]]:
    if not bigfive:
        return "", []
    
    bigfive_info = await process_bigfive_file(bigfive)
    return bigfive_info['detailed_analysis'], bigfive_info['vector']

def create_employee_id(db: Session) -> str:
    last_employee = db.query(Employee).order_by(Employee.employee_id.desc()).first()
    if last_employee:
        last_id = int(last_employee.employee_id[7:])
        new_id = f"SAPPORO{str(last_id + 1).zfill(4)}"
    else:
        new_id = "SAPPORO0001"
    return new_id

def save_employee_data(db: Session, employee: EmployeeCreate, career_info_detail: str, career_info_vector: list[float], 
                       personality_detail: str, personality_vector: list[float], picture: Optional[bytes] = None) -> Employee:
    try:
        new_employee_id = create_employee_id(db)

        new_employee = Employee(
            employee_id=new_employee_id,
            employee_name=employee.employee_name,
            birthdate=employee.birthdate,
            gender=employee.gender,
            academic_background=employee.academic_background,
            hire_date=employee.hire_date,
            recruitment_type=employee.recruitment_type,
            career_info_detail=career_info_detail,
            career_info_vector=career_info_vector,
            personality_detail=personality_detail,
            personality_vector=personality_vector,
            neuroticism_score=employee.neuroticism_score,
            extraversion_score=employee.extraversion_score,
            openness_score=employee.openness_score,
            agreeableness_score=employee.agreeableness_score,
            conscientiousness_score=employee.conscientiousness_score,
            password_hash=hash_password(employee.password),
            picture=picture
        )

        db.add(new_employee)
        db.flush()

        employee_grade = EmployeeGrade(
            employee_id=new_employee_id,
            grade_id=employee.grade_id
        )
        db.add(employee_grade)

        department_member = DepartmentMember(
            employee_id=new_employee_id,
            department_id=employee.department_id
        )
        db.add(department_member)

        db.commit()
        return new_employee

    except Exception as e:
        db.rollback()
        logging.exception("Unexpected error occurred while saving employee data")
        raise HTTPException(status_code=500, detail="Error saving employee data")

def create_employee_response(employee: Employee, db: Session) -> EmployeeResponse:
    grade = db.query(Grade).join(EmployeeGrade).filter(EmployeeGrade.employee_id == employee.employee_id).first()
    department = db.query(Department).join(DepartmentMember).filter(DepartmentMember.employee_id == employee.employee_id).first()

    picture_base64 = base64.b64encode(employee.picture).decode('utf-8') if employee.picture else None

    return EmployeeResponse(
        employee_id=employee.employee_id,
        employee_name=employee.employee_name,
        birthdate=employee.birthdate,
        gender=employee.gender,
        academic_background=employee.academic_background,
        hire_date=employee.hire_date,
        recruitment_type=employee.recruitment_type,
        grade_name=grade.grade_name if grade else None,
        department_name=department.department_name if department else None,
        neuroticism_score=employee.neuroticism_score,
        extraversion_score=employee.extraversion_score,
        openness_score=employee.openness_score,
        agreeableness_score=employee.agreeableness_score,
        conscientiousness_score=employee.conscientiousness_score,
        career_info_detail=employee.career_info_detail,
        career_info_vector=employee.career_info_vector,
        personality_detail=employee.personality_detail,
        personality_vector=employee.personality_vector,
        picture=picture_base64
    )

def get_grades(db: Session):
    return db.query(Grade).all()

def get_departments(db: Session):
    return db.query(Department).all()

def get_jobposts(db: Session):
    return db.query(JobPost).all()

def get_employees(db: Session):
    return db.query(Employee).all()

def get_employee_by_id(db: Session, employee_id: str):
    return db.query(Employee).filter(Employee.employee_id == employee_id).first()