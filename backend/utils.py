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
from models import Employee, EmployeeGrade, Grade, Department, DepartmentMember, JobPost, EmployeeJobAssignment
from schemas import EmployeeCreate, EmployeeResponse
import logging
import bcrypt
import base64

client = OpenAI()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def extract_text_from_pdf(contents: bytes) -> str:
    output_string = BytesIO()
    laparams = LAParams()
    extract_text_to_fp(BytesIO(contents), output_string, laparams=laparams)
    return output_string.getvalue().decode()

async def process_resume_file(file: UploadFile) -> Dict[str, Any]:
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    return process_resume(text)

def process_resume(text: str) -> Dict[str, Any]:
    prompt = f"""
    職務経歴書を詳細に分析し、候補者の職務経歴から読み取れる強みを以下のカテゴリーに分けて日本語で具体的かつ明確に説明してください。文章から推測できる情報を活用し、それを汎用的なポータブルスキルと専門的スキルに分けて記述してください。エンベディングベクトル化に適した形式で、明確かつ簡潔に説明することを意識してください：

    1. **専門的スキル**:
       - 職種や業界に特化した技術的なスキルや知識について、具体的なスキル名、習熟度、適用された文脈や状況を含めて記述してください。
       - 文章から推測できる他の関連スキルや技術についても言及し、具体的な事例やエピソードを用いて説明してください。

    2. **汎用的なポータブルスキル**:
       - 様々な職種や業界で応用可能な汎用的なスキルや能力について、具体的なスキル名、適用範囲、実績を記述してください。
       - 職務経歴書から読み取れる定性的な情報を基に、候補者の持つ潜在的な強みや能力についても分析し、文章に反映させてください。

    3. **主な職務内容と責任**:
       - これまでの経歴における主要な責任と成果を具体的に記述し、それらの役割を通じて発揮されたスキルや能力についても言及してください。
       - 特に、業務の中で得た経験や学びがどのように成果に結びついたかを、具体的な例を交えて明確に説明してください。

    4. **強みと差別化要因**:
       - 候補者の際立った特徴や、他の候補者と差別化できる点について、具体的なエピソードや実績を基に詳しく説明してください。
       - 職務経歴書に明記されていないが、文脈から推測される強みや特徴も含め、エンベディングベクトル化に有効な情報を提供してください。

    職務経歴書:
    {text}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは経験豊富なキャリアコンサルタントです。書類を詳細に分析し、候補者の強みを的確に言語化することができます。"},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
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
    以下のBigFive性格検査の結果を詳細に分析し、以下のカテゴリーに分けてその人の性格特性を日本語で具体的かつ明確に説明してください。文章から推測できる情報を活用し、ビジネス場面での活用方法や自己成長のためのアドバイスも含めてください。また、エンベディングベクトル化に適した形式で、明確かつ簡潔に説明することを意識してください：

    1. **その人固有の強み**:
       - 性格検査の結果から読み取れる、他の人と差別化できるその人固有の強みについて、具体的なエピソードや実績を交えて説明してください。
       - 文章から推測される潜在的な強みについても記述し、それがビジネス場面でどのように活用できるかを説明してください。

    2. **その人らしさ**:
       - 性格検査の結果から、特にその人らしさが表れる特徴や行動パターンについて説明してください。日常や仕事での具体的な例を挙げ、それらの特徴がどのように現れるかを説明してください。

    3. **行動特性**:
       - 性格検査結果に基づき、日常生活や職場における行動特性を具体的に説明してください。特定の状況下でどのような行動を取る傾向があるかについて言及し、ビジネスでの活用方法を示唆してください。

    4. **価値観**:
       - 性格検査結果からその人の価値観を読み取り、どのような状況や仕事に対して高い価値を感じるかについて具体的に説明してください。価値観がどのように意思決定や行動に影響を与えるかについても述べてください。

    5. **キャリア適性**:
       - 性格検査の結果から、その人に適したキャリアや職種について、具体的な理由と共に説明してください。特に、どのような職場環境や役割でその人が最も能力を発揮できるかについて詳述してください。

    6. **チーム内での役割**:
       - 性格検査結果に基づき、チーム内での役割について具体的に説明してください。その人がチームにどのように貢献できるか、またどのような役割が適しているかについて、具体的なエピソードや状況を交えて説明してください。

    それぞれの項目について、ビジネス場面での活用方法や自己成長のためのアドバイスも含めてください。

    BigFive性格検査結果:
    {text}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは経験豊富な人事コンサルタントです。BigFive性格検査の結果から人物の特徴を深く洞察し、キャリア開発やチーム編成に活用できる情報を提供することができます。"},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
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

async def process_career_files(resume: UploadFile) -> Tuple[str, list[float]]:
    resume_info = await process_resume_file(resume) if resume else {}
    career_info_vector = resume_info.get('vector', [])
    return career_info_vector

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

        job_assignment = EmployeeJobAssignment(
            employee_id=new_employee_id,
            jobpost_id=employee.jobpost_id,
            start_date=employee.hire_date
        )
        db.add(job_assignment)

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

def get_departments(db: Session):
    return db.query(Department).all()

def get_grades(db: Session):
    return db.query(Grade).all()

def get_jobposts(db: Session):
    return db.query(JobPost).all()

def get_jobposts_by_department(db: Session, department_id: int):
    return db.query(JobPost).filter(JobPost.department_id == department_id).all()

def get_employees(db: Session):
    return db.query(Employee).all()

def get_employee_by_id(db: Session, employee_id: str):
    return db.query(Employee).filter(Employee.employee_id == employee_id).first()