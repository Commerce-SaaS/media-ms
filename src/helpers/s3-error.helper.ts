import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

export function handleS3Error(error: any): never {
  const name = error?.name;
  const code = error?.code;

  // ------------------------------
  // Credenciales inválidas
  // ------------------------------
  if (name === 'InvalidAccessKeyId' || name === 'SignatureDoesNotMatch') {
    throw new RpcException({
      message: 'Invalid AWS credentials',
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  }

  // ------------------------------
  // Bucket no existe
  // ------------------------------
  if (name === 'NoSuchBucket') {
    throw new RpcException({
      message: 'Bucket does not exist',
      statusCode: HttpStatus.NOT_FOUND,
    });
  }

  // ------------------------------
  // Objeto no existe
  // ------------------------------
  if (name === 'NoSuchKey') {
    throw new RpcException({
      message: 'Image does not exist',
      statusCode: HttpStatus.NOT_FOUND,
    });
  }

  // ------------------------------
  // Acceso denegado
  // ------------------------------
  if (name === 'AccessDenied') {
    throw new RpcException({
      message: 'Access denied to S3 bucket',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }

  // ------------------------------
  // Errores de red
  // ------------------------------
  if (name === 'TimeoutError' || code === 'NetworkingError') {
    throw new RpcException({
      message: 'Network error communicating with S3',
      statusCode: HttpStatus.REQUEST_TIMEOUT,
    });
  }

  // ------------------------------
  // Error desconocido
  // ------------------------------
  throw new RpcException({
    message: `Unexpected S3 error: ${error.message ?? 'Unknown error'}`,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  });
}
