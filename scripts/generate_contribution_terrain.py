#!/usr/bin/env python3
"""
scripts/generate_contribution_terrain.py

Fetch GitHub contribution counts per day for the past N days and output a CSV heightmap.
Requires a GitHub personal access token with repo/public_repo access for higher rate limits.
"""
import os
import sys
import csv
import requests
from datetime import datetime, timedelta

GITHUB_API = "https://api.github.com"
TOKEN = os.getenv("GITHUB_TOKEN")
USER = "albin170"
DAYS = 365

if not TOKEN:
    print("Please set GITHUB_TOKEN environment variable with a personal access token.")
    sys.exit(1)

headers = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json"}

# This script gathers commit counts per day for the user's public events as a simple heuristic.
end = datetime.utcnow().date()
start = end - timedelta(days=DAYS-1)

print(f"Fetching events for {USER} from {start} to {end}...")

# Initialize counts dict
counts = {}
for i in range(DAYS):
    day = start + timedelta(days=i)
    counts[day.isoformat()] = 0

# Paginate user events (note: public events only)
page = 1
while True:
    url = f"{GITHUB_API}/users/{USER}/events/public?page={page}&per_page=100"
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        print("Error fetching events:", resp.status_code, resp.text)
        break
    events = resp.json()
    if not events:
        break
    for ev in events:
        created = ev.get("created_at", None)
        if not created:
            continue
        day = created.split("T")[0]
        if day in counts:
            # naive increment; you could filter by event type
            counts[day] += 1
    page += 1

# Output CSV heightmap: date,count
out_path = "contribution_heightmap.csv"
with open(out_path, "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["date", "count"])
    for day in sorted(counts.keys()):
        writer.writerow([day, counts[day]])

print(f"Wrote {out_path}. Use this CSV as a heightmap in Blender or other 3D tools.")
