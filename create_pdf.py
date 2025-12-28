"""Convert HTML to PDF using Playwright"""
import sys
import io
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

html_file = Path(__file__).parent / "VELOWEN_PROJECT_DOCUMENTATION.html"
pdf_file = Path(__file__).parent / "VELOWEN_PROJECT_DOCUMENTATION.pdf"

print(f"Converting {html_file.name} to PDF...")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    # Load HTML file
    page.goto(f"file://{html_file.absolute()}")
    
    # Wait for content to load
    page.wait_for_load_state("networkidle")
    
    # Generate PDF
    page.pdf(
        path=str(pdf_file.absolute()),
        format="A4",
        margin={
            "top": "2cm",
            "right": "2cm",
            "bottom": "2cm",
            "left": "2cm"
        },
        print_background=True
    )
    
    browser.close()

print(f"PDF created successfully: {pdf_file}")
print(f"File size: {pdf_file.stat().st_size / 1024:.1f} KB")


