import sys
sys.stdout.reconfigure(encoding="utf-8")
import psycopg2

db_url = "postgresql://neondb_owner:npg_yqFs5kIJ7Uzp@ep-crimson-hat-aocwprdn.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute('SELECT id, title, "publishedAt", category FROM "BlogPost" ORDER BY id DESC LIMIT 5')
rows = cur.fetchall()
for r in rows:
    print(r)

conn.close()
