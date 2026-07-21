# 🗂️ Media Microservice (`media-ms`)

> NestJS microservice responsible for media file storage using AWS S3 and RabbitMQ message-based communication.

---

# 📌 Purpose

`media-ms` is a **message-driven NestJS microservice** that manages file uploads and deletions for the Commerce App Launcher platform.

The service receives RPC-style messages through **RabbitMQ**, stores files in **AWS S3**, and returns the generated public URLs.

## Main responsibilities

- 📤 Upload media files to AWS S3
- 🗑️ Delete stored media objects
- 🔑 Generate unique object keys
- 🔄 Communicate through RabbitMQ messages

## Service characteristics

✅ RabbitMQ microservice  
✅ AWS S3 integration  
✅ Stateless architecture  
✅ No database dependency  
✅ No HTTP REST API  
✅ No event publishing  

---

# 🏗️ Architecture

```
                 ┌─────────────────┐
                 │ Other Services  │
                 └────────┬────────┘
                          │
                          │ RabbitMQ RPC
                          ▼
              ┌─────────────────────┐
              │      media-ms       │
              │                     │
              │ NestJS Microservice │
              └─────────┬───────────┘
                        │
                        │ AWS SDK
                        ▼
                  ┌───────────┐
                  │  AWS S3   │
                  │ Storage   │
                  └───────────┘
```

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| NestJS 11 | Microservice framework |
| TypeScript 5.7 | Programming language |
| `@nestjs/microservices` | RabbitMQ transport |
| RabbitMQ | RPC message broker |
| `amqplib` | RabbitMQ client |
| `amqp-connection-manager` | Connection handling |
| AWS SDK v3 | S3 integration |
| `@aws-sdk/client-s3` | Upload/delete operations |
| Zod | Environment validation |
| class-validator | DTO validation |
| class-transformer | DTO transformation |
| UUID | S3 object key generation |
| Jest + ts-jest | Testing framework |

---

# 📦 Installation

```bash
npm install
```

---

# ▶️ Running Locally

## Development

```bash
npm run start:dev
```

## Debug

```bash
npm run start:debug
```

## Production

```bash
npm run build

npm run start:prod
```

---

# ⚠️ Important: No HTTP API

This service does **not expose REST endpoints**.

The application starts exclusively as a RabbitMQ microservice:

```ts
NestFactory.createMicroservice()
```

There is:

- ❌ No HTTP controllers
- ❌ No REST API
- ❌ No HTTP listener

The `PORT` environment variable is only used in startup logs.

Example:

```
Media Microservice is running on port 4004
```

It does not create a server listening on that port.

---

# 🐳 Docker

The root `docker-compose.yml` runs:

```
media-ms

├── Source: ./media-ms
├── Container mapping: 4004:4004
└── PORT=4004
```

However:

⚠️ The application does not actually bind to this port.

Current inconsistencies:

| Location | Value |
|---|---|
| Docker compose | `4004:4004` |
| `.env.example` | `PORT=4004` |
| Dockerfile | `EXPOSE 4000` |

The service communicates through RabbitMQ, not TCP/HTTP.

---

# 🧪 Testing

Available scripts:

```bash
npm run test
```

```bash
npm run test:watch
```

```bash
npm run test:cov
```

```bash
npm run test:e2e
```

```bash
npm run test:debug
```

## Current status

⚠️ Tests are not implemented yet.

Current repository state:

```
❌ No *.spec.ts files
❌ No test directory
❌ No jest-e2e.json configuration
```

The Jest scripts currently exist only as scaffolding.

---

# 🔐 Environment Variables

Validated at startup using:

```
src/config/envs.ts
```

The application exits if required variables are missing.

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | Runtime environment |
| `PORT` | ❌ | Startup log only |
| `RABBITMQ_URL` | ✅ | RabbitMQ connection URL |
| `RABBITMQ_QUEUE` | ✅ | Queue consumed by the service |
| `AWS_ACCESS_KEY_ID` | ✅ | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | ✅ | AWS secret key |
| `AWS_REGION` | ✅ | AWS region |
| `AWS_BUCKET` | ✅ | Target S3 bucket |

---

# Example `.env`

```env
PORT=4004

NODE_ENV=development

RABBITMQ_URL=amqp://user:password@rabbitmq:5672
RABBITMQ_QUEUE=media_queue

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET=my-media-bucket
```

---

# 📨 RabbitMQ Communication

Transport:

```
RabbitMQ (Transport.RMQ)
```

The service consumes RPC-style messages.

Patterns are defined in:

```
src/media/patterns/media_patterns.ts
```

Handlers:

```
src/media/media.controller.ts
```

---

# 📬 Message Patterns

| Pattern | Handler | Payload | Response |
|---|---|---|---|
| `media.create` | `MediaController.create` | File object | `{ url, key }` |
| `media.delete` | `MediaController.remove` | S3 object key | Success message |

---

# 📤 Upload Flow (`media.create`)

Handler:

```
MediaController.create
```

Service method:

```
MediaService.upload()
```

Process:

1. Receives file payload:

```ts
{
  file: {
    buffer,
    mimetype,
    originalname
  }
}
```

2. Validates required data:

- File buffer
- MIME type

3. Generates a unique key:

```
uuid.extension
```

Example:

```
7c9f4b12-image.png
```

4. Uploads to S3:

```ts
PutObjectCommand
```

Configuration:

```ts
ACL: "public-read"
ContentType: mimetype
```

5. Returns:

```json
{
  "url": "https://bucket.s3.region.amazonaws.com/key",
  "key": "uuid.png"
}
```

---

# 🗑️ Delete Flow (`media.delete`)

Handler:

```
MediaController.remove
```

Service method:

```
MediaService.remove()
```

Process:

1. Receives S3 object key

Example:

```
7c9f4b12-image.png
```

2. Executes:

```ts
DeleteObjectCommand
```

3. Returns:

```json
{
  "message": "Media deleted successfully"
}
```

---

# 🚨 Error Handling

AWS errors are mapped through:

```
src/helpers/s3-error.helper.ts
```

| AWS Error | Status | Message |
|---|---|---|
| `InvalidAccessKeyId` | 401 | Invalid AWS credentials |
| `SignatureDoesNotMatch` | 401 | Invalid AWS credentials |
| `NoSuchBucket` | 404 | Bucket does not exist |
| `NoSuchKey` | 404 | Image does not exist |
| `AccessDenied` | 403 | Access denied |
| `TimeoutError` | 408 | Network error |
| Other errors | 500 | Unexpected S3 error |

---

# ☁️ AWS S3 Integration

Implemented using:

```ts
@aws-sdk/client-s3
```

Operations:

```ts
PutObjectCommand
DeleteObjectCommand
```

Current behavior:

✅ Public objects  
✅ Manual URL generation  
❌ No signed URLs  
❌ No private bucket flow  

Generated URLs:

```
https://<bucket>.s3.<region>.amazonaws.com/<key>
```

---

# 🔌 External Dependencies

## RabbitMQ

Required for startup.

Used for:

- Receiving upload requests
- Receiving delete requests

Environment:

```env
RABBITMQ_URL
RABBITMQ_QUEUE
```

---

## AWS S3

Required for:

- File storage
- Object deletion

Environment:

```env
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_BUCKET
```

---

## Database

This service does not use persistence.

Confirmed:

```
❌ No ORM
❌ No database client
❌ No migrations
❌ No database configuration
```

---

# 📁 Project Structure

```
media-ms/

├── src/
│
├── main.ts
│   └── RabbitMQ bootstrap + ValidationPipe
│
├── app.module.ts
│   └── Root module
│
├── config/
│   ├── envs.ts
│   │   └── Environment validation
│   │
│   ├── services.ts
│   │   └── RabbitMQ service token
│   │
│   └── transports/
│       └── rabbitmq.module.ts
│
├── helpers/
│   └── s3-error.helper.ts
│
└── media/
    ├── media.module.ts
    ├── media.controller.ts
    ├── media.service.ts
    ├── dto/
    │   └── create-media.dto.ts
    └── patterns/
        └── media_patterns.ts
```

---

# ⚠️ Current Limitations / TODO

## Port configuration

Review:

```
Dockerfile
docker-compose.yml
.env.example
```

Current values disagree:

```
Dockerfile        → 4000
docker-compose     → 4004
.env.example       → 4004
```

Also, no real listener exists.

---

## RabbitMQ queue configuration

Deployment queue value is injected through:

```
RABBITMQ_QUEUE_MEDIA
```

from the root environment.

The final production value is currently unknown.

---

## DTO Validation

Current DTO:

```
src/media/dto/create-media.dto.ts
```

is empty:

```ts
export class CreateMediaDto {}
```

The controller receives:

```ts
@Payload() data: any
```

Therefore:

- ❌ No automatic payload validation
- ❌ No schema enforcement

Only manual checks exist in:

```
MediaService.upload()
```

---

## RabbitMQ Client

The module:

```
src/config/transports/rabbitmq.module.ts
```

registers:

```
RMQ_SERVICE
```

but currently:

- ❌ Not injected
- ❌ Not used
- ❌ No outgoing messages

Possible future feature or leftover configuration.

---

## Testing

Missing:

```
❌ Unit tests
❌ Integration tests
❌ E2E tests
```

---

# ✅ Service Status

| Feature | Status |
|---|---|
| RabbitMQ consumer | ✅ Implemented |
| AWS S3 upload | ✅ Implemented |
| AWS S3 delete | ✅ Implemented |
| Public media URLs | ✅ Implemented |
| Database | ❌ Not required |
| HTTP API | ❌ Not exposed |
| Signed URLs | ❌ Not implemented |
| Automated tests | ⚠️ Pending |