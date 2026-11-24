"""
ParkEase - Smart Parking Management System
Unified One-Link Server (Backend API + Dynamic Frontend)

Usage:
    python run.py
"""
import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("\n" + "=" * 62)
    print("  🚀 ParkEase - Smart Parking Management System (Live)")
    print(f"  🌐 Unified URL : http://localhost:{port}")
    print("  🔑 Demo Driver : aarav@example.com   / User@1234")
    print("  🔑 Demo Admin  : admin@parkease.com  / Admin@123")
    print("=" * 62 + "\n")
    app.run(host="0.0.0.0", port=port, debug=False)
