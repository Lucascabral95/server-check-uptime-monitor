variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "server-check"
}
variable "instance_type" {
  type        = string
  default     = "m7i-flex.large"
  description = "8 GiB instance required by the complete Compose stack. Choose an EC2 Free Tier eligible type for eligible new AWS accounts."
}
variable "ses_from_email" {
  type      = string
  sensitive = true
}

variable "budget_alert_email" {
  type    = string
  default = ""
}

variable "monthly_budget_usd" {
  type    = number
  default = 15
}
