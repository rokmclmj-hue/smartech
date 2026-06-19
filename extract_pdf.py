import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from pypdf import PdfReader
reader = PdfReader(r'C:\Users\rokmc\smartech\public\catalogs\12.터보펌프_STP.pdf')
print(f'Total pages: {len(reader.pages)}')
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text and text.strip():
        print(f'--- Page {i+1} ---')
        print(text)
        print()
