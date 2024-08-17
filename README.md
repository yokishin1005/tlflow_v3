## Backend
・python -m venv .venv

・.venv/Scripts/activate

・pip install -r requirements.txt

・uvicorn app.main:app --reload

※envファイルを設定→OpenAI API KEYを格納

https://platform.openai.com/api-keys

## Frontend
・npm install

・npm install framer-motion

・ルートディレクトリーに.envファイルを作成→NEXT_PUBLIC_API_URL=http://localhost:8000と入力

・npm run dev


