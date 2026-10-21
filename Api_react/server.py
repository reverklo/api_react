import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MovieWorldHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # Ensure JSX and JSON are sent with proper content types
        if path.endswith('.jsx'):
            return 'application/javascript; charset=utf-8'
        if path.endswith('.json'):
            return 'application/json; charset=utf-8'
        return super().guess_type(path)

def run():
    os.chdir(DIRECTORY)
    handler = MovieWorldHTTPRequestHandler
    
    # Try port 3000, fallback to 8000, 8080 if in use
    for port in [3000, 8000, 8080, 5000]:
        try:
            with socketserver.TCPServer(("", port), handler) as httpd:
                print(f"==================================================")
                print(f"🎬 Movie World Server is RUNNING!")
                print(f"👉 Localhost URL: http://localhost:{port}")
                print(f"👉 Directory:     {DIRECTORY}")
                print(f"Press Ctrl+C to stop.")
                print(f"==================================================")
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError:
            print(f"Port {port} is busy, trying next port...")
            continue

if __name__ == '__main__':
    run()
