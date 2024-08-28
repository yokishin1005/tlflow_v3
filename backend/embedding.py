import os
from openai import OpenAI
import sqlalchemy as sa
from sqlalchemy import create_engine, MetaData, Table, select
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import json
from models import JobPost

# .env ファイルから APIキーとデータベースURLを読み込む
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

# OpenAI APIキーを設定
client = OpenAI(api_key=OPENAI_API_KEY)

# SQLAlchemy データベース接続設定
engine = create_engine(DATABASE_URL)
metadata = MetaData()
Session = sessionmaker(bind=engine)
session = Session()

# テーブル定義
job_post = Table('job_post', metadata, autoload_with=engine)

## Embeddingを生成する関数
def get_embedding(text, model="text-embedding-3-large"): 
    text = text.replace("\n", " ")  # 改行をスペースに置換
    return client.embeddings.create(input = [text], model=model).data[0].embedding

# job_postテーブルの全てのレコードに対してembeddingを生成し、job_detail_vectorに挿入
def update_job_detail_vectors():
    with engine.connect() as connection:
        # job_postテーブルからjobpost_idとjob_detailを取得
        query = select(job_post.c.jobpost_id, job_post.c.job_detail)
        result = connection.execute(query)

        for row in result:
            jobpost_id = row[0]  # インデックスでアクセス
            job_detail = row[1]

            # job_detailをembeddingに変換
            embedding = get_embedding(job_detail)

            # embeddingをjob_detail_vectorに挿入
            update_query = job_post.update().where(job_post.c.jobpost_id == jobpost_id).values(job_detail_vector=json.dumps(embedding))
            connection.execute(update_query)
            print(f"Updated jobpost_id {jobpost_id} with embedding.")

if __name__ == "__main__":
    update_job_detail_vectors()