"""Convert Test Plan Markdown to PDF using weasyprint with rich colors."""
import markdown
from weasyprint import HTML
import os

SRC = os.path.join(os.path.dirname(__file__), "Deborah_Mbula_Test_Plan.md")
DST_DIR = os.path.join(os.path.dirname(__file__), "FYP2_Submissions")
DST = os.path.join(DST_DIR, "Deborah_Mbula_Test_Plan.pdf")

os.makedirs(DST_DIR, exist_ok=True)

with open(SRC, "r") as f:
    md_text = f.read()

html_body = markdown.markdown(md_text, extensions=["tables", "toc", "fenced_code"])

full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
@page {{
    size: A4;
    margin: 2.54cm 2.54cm 2.54cm 3.17cm;
    @bottom-center {{
        content: counter(page);
        font-family: 'Times New Roman', Times, serif;
        font-size: 10pt;
    }}
}}
body {{
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #1a1a1a;
}}
h1 {{
    font-size: 18pt;
    font-weight: bold;
    color: #0d47a1;
    border-bottom: 3px solid #1565c0;
    padding-bottom: 6pt;
    margin-top: 28pt;
    page-break-after: avoid;
}}
h2 {{
    font-size: 15pt;
    font-weight: bold;
    color: #1b5e20;
    border-left: 4px solid #2e7d32;
    padding-left: 10pt;
    margin-top: 22pt;
    page-break-after: avoid;
}}
h3 {{
    font-size: 13pt;
    font-weight: bold;
    color: #4a148c;
    margin-top: 16pt;
    page-break-after: avoid;
}}
table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
    font-size: 10pt;
    page-break-inside: avoid;
}}
th {{
    background: linear-gradient(135deg, #1a237e, #283593);
    background-color: #1a237e;
    color: white;
    font-weight: bold;
    padding: 8pt 8pt;
    text-align: left;
    border: 1px solid #1a237e;
}}
td {{
    border: 1px solid #bdbdbd;
    padding: 6pt 8pt;
    text-align: left;
    vertical-align: top;
}}
tr:nth-child(even) {{
    background-color: #e8eaf6;
}}
tr:nth-child(odd) {{
    background-color: #ffffff;
}}
tr:hover {{
    background-color: #c5cae9;
}}
code {{
    font-family: 'Courier New', monospace;
    font-size: 9.5pt;
    background-color: #fff3e0;
    color: #e65100;
    padding: 2pt 5pt;
    border-radius: 3pt;
    border: 1px solid #ffe0b2;
}}
pre {{
    background-color: #263238;
    color: #eceff1;
    padding: 12pt;
    border: none;
    border-radius: 6pt;
    font-size: 9pt;
    overflow-x: auto;
    page-break-inside: avoid;
    line-height: 1.6;
}}
pre code {{
    background-color: transparent;
    color: #eceff1;
    border: none;
    padding: 0;
}}
hr {{
    border: none;
    border-top: 2px solid #e0e0e0;
    margin: 20pt 0;
}}
strong {{
    color: #b71c1c;
}}
ul, ol {{
    margin-left: 20pt;
}}
li {{
    margin-bottom: 4pt;
}}
p {{
    text-align: justify;
}}
a {{
    color: #1565c0;
    text-decoration: none;
}}
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

HTML(string=full_html).write_pdf(DST)
print(f"PDF saved to: {DST}")
