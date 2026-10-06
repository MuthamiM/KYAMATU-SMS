"""Convert Implementation Plan Markdown to PDF using weasyprint."""
import markdown
from weasyprint import HTML
import os

SRC = os.path.join(os.path.dirname(__file__), "Deborah_Mbula_Implementation_Plan.md")
DST_DIR = os.path.join(os.path.dirname(__file__), "FYP2_Submissions")
DST = os.path.join(DST_DIR, "Deborah_Mbula_Implementation_Plan.pdf")

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
    color: #000;
}}
h1 {{
    font-size: 18pt;
    font-weight: bold;
    color: #1a1a2e;
    border-bottom: 2px solid #1a1a2e;
    padding-bottom: 6pt;
    margin-top: 24pt;
    page-break-after: avoid;
}}
h2 {{
    font-size: 15pt;
    font-weight: bold;
    color: #16213e;
    margin-top: 18pt;
    page-break-after: avoid;
}}
h3 {{
    font-size: 13pt;
    font-weight: bold;
    color: #0f3460;
    margin-top: 14pt;
    page-break-after: avoid;
}}
table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
    font-size: 11pt;
    page-break-inside: avoid;
}}
th, td {{
    border: 1px solid #333;
    padding: 6pt 8pt;
    text-align: left;
    vertical-align: top;
}}
th {{
    background-color: #1a1a2e;
    color: white;
    font-weight: bold;
}}
tr:nth-child(even) {{
    background-color: #f5f5f5;
}}
code {{
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    background-color: #f0f0f0;
    padding: 2pt 4pt;
    border-radius: 2pt;
}}
pre {{
    background-color: #f4f4f4;
    padding: 10pt;
    border: 1px solid #ddd;
    border-radius: 4pt;
    font-size: 9pt;
    overflow-x: auto;
    page-break-inside: avoid;
}}
hr {{
    border: none;
    border-top: 1px solid #ccc;
    margin: 16pt 0;
}}
strong {{
    color: #1a1a2e;
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
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

HTML(string=full_html).write_pdf(DST)
print(f"PDF saved to: {DST}")
