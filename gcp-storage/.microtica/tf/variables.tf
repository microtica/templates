variable "bucket_name" {
  type        = string
  description = "The name of the bucket"
}

variable "bucket_location" {
  type        = string
  description = "The GCS location"

  validation {
    condition     = contains(["US", "EU", "ASIA", "AU", "CA", "IN"], var.bucket_location)
    error_message = "Allowed values for input_parameter are \"US\", \"EU\", \"ASIA\", \"AU\", \"CA\", \"IN\"."
  }
}
