import { z } from 'zod';
import 'dotenv/config';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z.coerce.number().default(3000),
    RABBITMQ_URL: z.string().refine((val) => /^amqps?:\/\//.test(val), {
      message: 'RABBITMQ_URL must start with amqp:// or amqps://',
    }),
    RABBITMQ_QUEUE: z.string().min(1, 'RABBITMQ_QUEUE cannot be empty'),
    AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID cannot be empty'),
    AWS_SECRET_ACCESS_KEY: z
      .string()
      .min(1, 'AWS_SECRET_ACCESS_KEY cannot be empty'),
    AWS_REGION: z.string().min(1, 'AWS_REGION cannot be empty'),
    AWS_BUCKET: z.string().min(1, 'AWS_BUCKET cannot be empty')
  })
  .required();

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error('Invalid environment variables');
}

export const envs = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  rabbitmqUrl: parsedEnv.data.RABBITMQ_URL,
  rabbitmqQueue: parsedEnv.data.RABBITMQ_QUEUE,
  awsAccessKey: parsedEnv.data.AWS_ACCESS_KEY_ID,
  awsAccessSecretKey: parsedEnv.data.AWS_SECRET_ACCESS_KEY,
  awsS3Region: parsedEnv.data.AWS_REGION,
  awsBucketName: parsedEnv.data.AWS_BUCKET
};
