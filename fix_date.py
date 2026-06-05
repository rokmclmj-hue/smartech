import sys
sys.stdout.reconfigure(encoding="utf-8")
import os
import psycopg2

# DB URL은 환경변수에서 읽어야 합니다 (.env 파일 사용)
db_url = os.environ.get("DATABASE_URL", "")
if not db_url:
    print("ERROR: DATABASE_URL 환경변수가 없습니다.")
    sys.exit(1)

conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute('SELECT id, title, "publishedAt", category FROM "BlogPost" ORDER BY id DESC LIMIT 5')
rows = cur.fetchall()
for r in rows:
    print(r)

conn.close()
