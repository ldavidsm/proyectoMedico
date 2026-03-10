
import boto3
from botocore.exceptions import ClientError
from botocore.client import Config
import os
from dotenv import load_dotenv

load_dotenv()

class S3Service:
    def __init__(self):
        self.aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.bucket_name = os.getenv("AWS_S3_BUCKET_NAME")
        self.region = os.getenv("AWS_S3_REGION")

        if not all([self.aws_access_key, self.aws_secret_key, self.bucket_name, self.region]):
            raise ValueError("Faltan variables de entorno de AWS S3")

        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=self.aws_access_key,
            aws_secret_access_key=self.aws_secret_key,
            region_name=self.region,
            config=Config(signature_version='s3v4')
        )

    def generate_presigned_upload_url(self, key: str, file_type: str, expiration=3600):
        """
        Genera una URL firmada para subir un archivo directamente a S3 (PUT).
        """
        try:
            response = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key,
                    'ContentType': file_type
                },
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            print(f"Error generando URL de subida S3: {e}")
            return None

    def generate_presigned_url(self, key: str, expiration=3600):
        """
        Genera una URL firmada para ver/descargar un archivo privado.
        """
        try:
            response = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key
                },
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            print(f"Error generando URL de descarga S3: {e}")
            return None

    def delete_file(self, key: str):
        """
        Elimina un objeto de S3.
        """
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError as e:
            print(f"Error borrando archivo S3: {e}")
            return False

    def file_exists(self, key: str):
        """
        Verifica si un archivo existe en S3 (metadata check).
        """
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError:
            return False

s3_service = S3Service()
