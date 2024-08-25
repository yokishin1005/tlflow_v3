import chardet
from openai import OpenAI
from typing import Dict, Any
from io import BytesIO
import re
from typing import Optional
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams
from main import Session
import datetime
from models import Employee, EmployeeGrade, Grade, Department, DepartmentMember
from schemas import EmployeeCreate, EmployeeResponse

client = OpenAI()

async def process_rirekisho_file(contents: bytes, content_type: str) -> Dict[str, Any]:
    if content_type == "application/pdf":
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

async def process_resume_file(contents: bytes) -> Dict[str, Any]:
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
    embedding = get_embedding(analysis, model='text-embedding-3-large')

    return {
        "analysis": analysis,
        "vector": embedding
    }

async def process_bigfive_file(contents: bytes) -> Dict[str, Any]:
    text = extract_text_from_pdf(contents)
    return process_bigfive(text)

# Example of how to use this in your process_bigfive function
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
    embedding = get_embedding(analysis, model='text-embedding-3-large')

    return {
        "detailed_analysis": analysis,
        "vector": embedding
    }


def update_employee_career(db: Session, employee: Employee, career_info: str):
    employee.career_info_detail = career_info
    employee.career_info_processed = False
    db.commit()
    db.refresh(employee)
    return employee

async def process_career_info(employee_id: str, career_info: str):
    db = SessionLocal()
    try:
        employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
        if employee:
            career_info_embedding = await get_embedding_async(career_info)
            employee.career_info_vector = json.dumps(career_info_embedding)
            employee.career_info_processed = True
            db.commit()
    finally:
        db.close()

async def process_personality(db: Session, employee_id: str, personality_data: str):
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise ValueError(f"Employee with id {employee_id} not found")
    
    personality_embedding = await get_embedding_async(personality_data)
    employee.personality_vector = json.dumps(personality_embedding)
    db.commit()
    db.refresh(employee)
    return employee

async def get_embedding_async(text: str, model: str = "text-embedding-3-large") -> list[float]:
    text = text.replace("\n", " ")
    response = await client.embeddings.create(input=[text], model=model)
    return response.data[0].embedding


def create_employee_id(db: Session):
    last_employee = db.query(Employee).order_by(Employee.employee_id.desc()).first()
    if last_employee:
        last_id = int(last_employee.employee_id[7:])
        new_id = f"SAPPORO{str(last_id + 1).zfill(4)}"
    else:
        new_id = "SAPPORO0001"
    return new_id

def save_employee_data(db: Session, employee: EmployeeCreate, picture: Optional[bytes] = None):
    try:
        new_employee_id = create_employee_id(db)
        
        new_employee = Employee(
            employee_id=new_employee_id,
            employee_name=employee.employee_name,
            birthdate=datetime.datetime.strptime(employee.birthdate, "%Y-%m-%d").date(),
            gender=employee.gender,
            academic_background=employee.academic_background,
            hire_date=employee.hire_date,
            recruitment_type=employee.recruitment_type,
            career_info_detail=employee.career_info_detail,
            career_info_vector=json.dumps(career_info_vector),
            personality_detail=employee.personality_detail,
            personality_vector=json.dumps(personality_vector),
            neuroticism_score=employee.neuroticism_score,          # 神経症傾向スコア
            extraversion_score=employee.extraversion_score,        # 外向性スコア
            openness_score=employee.openness_score,               # 経験への開放性スコア
            agreeableness_score=employee.agreeableness_score,      # 協調性スコア
            conscientiousness_score=employee.conscientiousness_score, # 誠実性スコア
            bigfive_scores=json.dumps(employee.bigfive_scores)
        )
        
        if picture:
            new_employee.picture = picture  # 画像データを保存

        db.add(new_employee)
        db.flush()
        
        grade = db.query(Grade).filter(Grade.grade_name == employee.grade_name).first()
        if grade:
            employee_grade = EmployeeGrade(employee_id=new_employee.employee_id, grade_id=grade.grade_id)
            db.add(employee_grade)
        
        department = db.query(Department).filter(Department.department_name == employee.department_name).first()
        if department:
            department_member = DepartmentMember(employee_id=new_employee.employee_id, department_id=department.department_id)
            db.add(department_member)
        
        db.commit()
        db.refresh(new_employee)
        
        return new_employee
    
    except Exception as e:
        db.rollback()  # データベース操作でエラーが発生した場合にロールバック
        raise HTTPException(status_code=400, detail=f"Error saving employee data: {str(e)}")

def get_grades(db: Session):
    return db.query(Grade).all()

def get_departments(db: Session):
    return db.query(Department).all()

def get_employees(db: Session):
    return db.query(Employee).all()

def get_employee_by_id(db: Session, employee_id: str):
    return db.query(Employee).filter(Employee.employee_id == employee_id).first()

def get_embedding(text: str, model="text-embedding-3-small"):
    text = text.replace("\n", " ")
    return client.embeddings.create(input=[text], model=model).data[0].embedding
