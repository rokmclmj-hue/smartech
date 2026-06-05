import sys
sys.stdout.reconfigure(encoding="utf-8")
import psycopg2

db_url = "postgresql://neondb_owner:npg_yqFs5kIJ7Uzp@ep-crimson-hat-aocwprdn.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
conn = psycopg2.connect(db_url)
cur = conn.cursor()

for post_id in [20, 22]:
    cur.execute('SELECT id, title, content FROM "BlogPost" WHERE id = %s', (post_id,))
    row = cur.fetchone()
    if row:
        print(f"\n=== id={row[0]} ===")
        print(f"제목: {row[1]}")
        print("--- 끝 200자 ---")
        print(row[2][-200:])

conn.close()
