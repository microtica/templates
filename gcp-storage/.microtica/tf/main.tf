resource "google_storage_bucket" "bucket" {
  name     = var.bucket_name
  location = var.bucket_location
}

output "bucket_name" {
  value = google_storage_bucket.bucket.name
}

output "bucket_url" {
  value = google_storage_bucket.bucket.url
}
