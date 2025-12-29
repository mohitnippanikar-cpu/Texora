"""Upload a PDF to Google Cloud Storage.

Usage:
  python scripts/upload_pdf.py <local-path> [--bucket BUCKET] [--dest DEST]

If the bucket doesn't exist it will be created in asia-south1.
"""
import argparse
import os
import sys
from google.cloud import storage
from google.api_core.exceptions import NotFound

DEFAULT_BUCKET = "tender-bucker"
GCP_PROJECT = "careful-prism-339613"
BUCKET_LOCATION = "asia-south1"


def ensure_bucket(client: storage.Client, bucket_name: str):
    try:
        bucket = client.get_bucket(bucket_name)
        print(f"Bucket exists: {bucket_name}")
        return bucket
    except Exception:
        print(f"Bucket {bucket_name} not found. Creating it in location {BUCKET_LOCATION}...")
        bucket = client.create_bucket(bucket_name, location=BUCKET_LOCATION)
        print(f"Bucket created: {bucket_name}")
        return bucket


def upload_pdf(local_path: str, bucket_name: str, dest_blob: str):
    if not os.path.isfile(local_path):
        print(f"File not found: {local_path}")
        sys.exit(1)

    client = storage.Client(project=GCP_PROJECT)

    bucket = ensure_bucket(client, bucket_name)

    blob = bucket.blob(dest_blob)
    blob.upload_from_filename(local_path, content_type="application/pdf")
    print(f"Uploaded {local_path} to gs://{bucket_name}/{dest_blob}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("file", help="Local path to the PDF file")
    parser.add_argument("--bucket", default=DEFAULT_BUCKET, help="GCS bucket name")
    parser.add_argument("--dest", help="Destination blob name in bucket (defaults to basename)")
    args = parser.parse_args()

    dest = args.dest or os.path.basename(args.file)
    upload_pdf(args.file, args.bucket, dest)
