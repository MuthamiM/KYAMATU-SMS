from docx2pdf import convert
import os
import glob

docs = glob.glob(r"c:\Users\Admin\Library\docs\[3-7]_*.docx")
for doc in docs:
    print(f"Converting {os.path.basename(doc)}...")
    convert(doc)
print("Done converting remaining DOCX files to PDF.")
