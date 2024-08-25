## Backend
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload

## Frontend
npm install
npm install framer-motion
他のいろいろモジュール必要かも・・
ルートディレクトリーに.envファイルを作成
NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev

