output "cloudfront_url" { value = "https://${aws_cloudfront_distribution.web.domain_name}" }
output "artifact_bucket" { value = aws_s3_bucket.artifacts.bucket }
output "backup_bucket" { value = aws_s3_bucket.backups.bucket }
output "bootstrap_parameter_name" { value = aws_ssm_parameter.bootstrap.name }
output "instance_id" { value = aws_instance.app.id }
output "cognito_user_pool_id" { value = aws_cognito_user_pool.main.id }
output "cognito_client_id" { value = aws_cognito_user_pool_client.web.id }
output "cognito_issuer" { value = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}" }
