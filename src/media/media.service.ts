import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { envs } from 'src/config/envs';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { RpcException } from '@nestjs/microservices';
import { handleS3Error } from 'src/helpers/s3-error.helper';

@Injectable()
export class MediaService {
  private readonly s3Client = new S3Client({
    region: envs.awsS3Region,
    credentials: {
      accessKeyId: envs.awsAccessKey,
      secretAccessKey: envs.awsAccessSecretKey,
    },
  });

  async upload(data: any) {
    const { buffer, originalname, mimetype } = data.file ?? {};

    if (!buffer || !mimetype) {
      throw new RpcException({
        message: 'Invalid file or file data missing',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const fileBuffer = Buffer.from(buffer);

    const key = uuidv4();

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: envs.awsBucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: mimetype,
          ACL: 'public-read',
        }),
      );

      return {
        url: `https://${envs.awsBucketName}.s3.${envs.awsS3Region}.amazonaws.com/${key}`,
        key,
      };
    } catch (error) {
      handleS3Error(error);
    }
  }

  async remove(id: string) {
    try {
      const response = await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: envs.awsBucketName,
          Key: id,
        }),
      );

      return { message: 'Media deleted successfully' };
    } catch (error) {
      handleS3Error(error);
    }
  }
}
