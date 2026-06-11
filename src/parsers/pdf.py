import sys
import json

try:
    import PyPDF2
except ImportError:
    print(json.dumps({"success": False, "error": "PyPDF2 is not installed. Please run: pip install PyPDF2"}))
    sys.exit(1)

def parse_pdf(file_path):
    try:
        text_content = []
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text_content.append(page.extract_text() or "")
        
        result = {
            "success": True,
            "text": "\n".join(text_content),
            "page_count": len(reader.pages)
        }
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path provided"}))
        sys.exit(1)
    parse_pdf(sys.argv[1])
