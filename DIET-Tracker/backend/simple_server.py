#!/usr/bin/env python3
"""Simple HTTP server for food analysis - bypasses FastAPI multipart issues"""

import http.server
import json
import base64
import os
import sys
import traceback
from io import BytesIO
from urllib.parse import urlparse, parse_qs

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from app.detector import FoodDetector

detector = FoodDetector()

class FoodAnalysisHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/" or self.path == "/health":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "message": "DEIT Food Tracker API running"}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/analyze":
            try:
                content_length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_length)
                
                # Parse JSON with base64 encoded image
                data = json.loads(body.decode())
                image_base64 = data.get("image", "")
                
                if not image_base64:
                    self.send_response(400)
                    self.send_header("Content-type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "No image provided"}).encode())
                    return
                
                # Decode base64 image
                image_bytes = base64.b64decode(image_base64)
                
                # Analyze
                result = detector.detect(image_bytes)
                
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
            except Exception as e:
                print(f"ERROR processing request: {e}", file=sys.stderr)
                traceback.print_exc()
                self.send_response(500)
                self.send_header("Content-type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        # Custom logging
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), format%args))

if __name__ == "__main__":
    server = http.server.HTTPServer(("0.0.0.0", 8001), FoodAnalysisHandler)
    print("✓ Server running on http://localhost:8001")
    print("✓ POST /analyze with JSON: {\"image\": \"<base64 encoded image>\"}")
    print("✓ GET /health for health check")
    print()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
