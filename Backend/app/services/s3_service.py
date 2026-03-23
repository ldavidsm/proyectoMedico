import boto3
from botocore.exceptions import ClientError
from botocore.client import Config as BotoConfig
from app.config import (
    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_REGION, AWS_S3_BUCKET_NAME,
)


class S3Service:
    _instance = None
    _client = None

    def __init__(self):
        pass

    @property
    def client(self):
        if self._client is None:
            if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY]):
                raise Exception("Servicio S3 no configurado. Faltan credenciales AWS.")

            self._client = boto3.client(
                's3',
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                region_name=AWS_S3_REGION,
                endpoint_url=f'https://s3.{AWS_S3_REGION}.amazonaws.com',
                config=BotoConfig(signature_version='s3v4'),
            )
        return self._client

    @property
    def bucket_name(self):
        if not AWS_S3_BUCKET_NAME:
            raise Exception("Servicio S3 no configurado. Falta nombre de bucket.")
        return AWS_S3_BUCKET_NAME

    def generate_presigned_upload_url(self, key: str, file_type: str, expiration=3600):
        try:
            response = self.client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key,
                    'ContentType': file_type
                },
                ExpiresIn=expiration
            )
            return response
        except Exception as e:
            print(f"Error generando URL de subida S3: {e}")
            return None

    def generate_presigned_url(self, key: str, expiration=3600):
        try:
            response = self.client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key
                },
                ExpiresIn=expiration
            )
            return response
        except Exception as e:
            print(f"Error generando URL de descarga S3: {e}")
            return None

    def delete_file(self, key: str):
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except Exception as e:
            print(f"Error borrando archivo S3: {e}")
            return False

    def get_public_url(self, key: str) -> str:
        return f"https://{self.bucket_name}.s3.{AWS_S3_REGION}.amazonaws.com/{key}"

    def file_exists(self, key: str):
        try:
            self.client.head_object(Bucket=self.bucket_name, Key=key)
            return True
        except Exception:
            return False

s3_service = S3Service()
