# 🎬 Media Microservice (media-ms)

## 🧩 Microservice Overview

The **Media Microservice** is a specialized NestJS microservice designed to handle media asset management within a distributed commerce application. It provides asynchronous file upload and deletion operations through RabbitMQ message queues, with AWS S3 as the primary storage backend.

**Role in the System:** This microservice serves as the media processing layer for the commerce platform, decoupling media operations from the main application layer and enabling horizontal scalability. It handles file storage, retrieval URLs, and cleanup operations without requiring direct HTTP calls, making it ideal for high-throughput scenarios.

---

## 🏗️ Architecture

The microservice is structured following a **modular, layered architecture pattern** typical of enterprise NestJS applications:

```
┌─────────────────────────────────────────────────────────────┐
│                    Message Queue Layer                       │
│                   (RabbitMQ Transport)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   MediaController                            │
│          (Message Pattern Handlers - @MessagePattern)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   MediaService                               │
│         (Business Logic - Upload, Delete Operations)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  AWS S3 Storage Layer                        │
│              (PutObjectCommand, DeleteObjectCommand)         │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns:

- **Microservices Architecture:** RPC-based communication via RabbitMQ
- **Dependency Injection:** NestJS built-in IoC container for service management
- **Error Handling:** Centralized S3 error handler with proper HTTP status mapping
- **Configuration Management:** Environment validation with Zod schema
- **Global Pipes:** Automatic DTOs validation and transformation

---

## ⚙️ Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Runtime** | Node.js | Latest LTS |
| **Framework** | NestJS | ^11.0.1 |
| **Language** | TypeScript | ^5.7.3 |
| **Message Queue** | RabbitMQ | 5.0+ |
| **Cloud Storage** | AWS S3 | (SDK v3) |
| **AWS SDK** | @aws-sdk/client-s3 | ^3.943.0 |
| **Validation** | Zod | ^4.1.13 |
| **DTO Validation** | class-validator | ^0.14.3 |
| **Data Transformation** | class-transformer | ^0.5.1 |
| **UUID Generation** | uuid | ^8.3.2 |
| **Testing** | Jest | ^29.7.0 |
| **Code Quality** | ESLint | ^9.18.0 |
| **Formatting** | Prettier | ^3.4.2 |

---

## 📁 Project Structure

```
media-ms/
├── src/
│   ├── main.ts                           # Application entry point & bootstrap
│   ├── app.module.ts                     # Root application module
│   ├── config/                           # Configuration layer
│   │   ├── envs.ts                       # Environment variables validation (Zod schema)
│   │   ├── services.ts                   # Service constants (RMQ_SERVICE)
│   │   └── transports/
│   │       └── rabbitmq.module.ts        # RabbitMQ client configuration
│   ├── helpers/
│   │   └── s3-error.helper.ts            # Centralized S3 error handling & mapping
│   └── media/                            # Media module (main business logic)
│       ├── media.module.ts               # Media module definition
│       ├── media.controller.ts           # RPC message pattern handlers
│       ├── media.service.ts              # Core business logic (upload/delete)
│       ├── dto/
│       │   └── create-media.dto.ts       # DTO for media creation (placeholder)
│       └── patterns/
│           └── media_patterns.ts         # Message pattern constants
├── dockerfile                            # Container image definition
├── package.json                          # Dependencies & npm scripts
├── tsconfig.json                         # TypeScript root configuration
├── tsconfig.build.json                   # TypeScript build configuration
├── eslint.config.mjs                     # ESLint configuration
├── nest-cli.json                         # NestJS CLI configuration
└── README.md                             # Project documentation
```

### Directory Responsibilities:

- **`config/`** - Centralized environment configuration and external service setup (RabbitMQ)
- **`helpers/`** - Utility functions and error handlers for external integrations
- **`media/`** - Feature module containing business logic, DTOs, and message patterns
- **`patterns/`** - Message queue pattern definitions for inter-service communication

---

## 🔌 Environment Variables

All environment variables are **validated at startup** using Zod schema validation. The application will not start if required variables are missing or invalid.

| Variable | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `NODE_ENV` | `enum` | ✅ Yes | Execution environment | `development`, `production`, `test` |
| `PORT` | `number` | ❌ No | Service port (unused - runs on RMQ) | `3000` |
| `RABBITMQ_URL` | `string` | ✅ Yes | RabbitMQ connection URL | `amqps://user:pass@rabbit.example.com:5671` |
| `RABBITMQ_QUEUE` | `string` | ✅ Yes | Queue name for message consumption | `media-service-queue` |
| `AWS_ACCESS_KEY_ID` | `string` | ✅ Yes | AWS IAM access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | `string` | ✅ Yes | AWS IAM secret access key | `...` |
| `AWS_REGION` | `string` | ✅ Yes | AWS S3 region | `us-east-1`, `eu-west-1` |
| `AWS_BUCKET` | `string` | ✅ Yes | S3 bucket name for media storage | `my-commerce-media-prod` |

### Environment Validation Rules:

- `NODE_ENV` must be one of: `development`, `production`, `test`
- `RABBITMQ_URL` must start with `amqp://` or `amqps://` protocol
- `RABBITMQ_QUEUE` cannot be empty
- All AWS credentials must be non-empty strings
- Validation errors are logged and terminate the application startup

### Example `.env` File:

```bash
NODE_ENV=production
PORT=3000
RABBITMQ_URL=amqps://user:password@rabbitmq.example.com:5671
RABBITMQ_QUEUE=media-service-queue
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_BUCKET=my-commerce-media-bucket
```

---

## 🚀 Installation & Running

### Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ (included with Node.js)
- **RabbitMQ**: v5.0+ accessible at configured URL
- **AWS Account**: With S3 bucket and IAM credentials

### Installation

```bash
# Install dependencies
npm install

# Optional: Verify installation
npm list | head -20
```

### Running the Service

```bash
# Development mode (watch mode with auto-reload)
npm run start:dev

# Production mode (optimized build)
npm run build
npm run start:prod

# Debug mode (Node inspector on port 9229)
npm run start:debug
```

### Expected Output

```
[Nest] 12345 - 04/13/2026, 10:30:22 AM   [NestFactory] Starting Nest application...
[Nest] 12345 - 04/13/2026, 10:30:23 AM   [InstanceLoader] ConfigModule dependencies initialized
[Nest] 12345 - 04/13/2026, 10:30:23 AM   [InstanceLoader] RabbitMQModule dependencies initialized
[Nest] 12345 - 04/13/2026, 10:30:23 AM   [InstanceLoader] MediaModule dependencies initialized
[MediaMS-Main] Media Microservice is running on port 3000
```

---

## 📡 API Endpoints (RabbitMQ Message Patterns)

This microservice communicates exclusively through RabbitMQ message patterns. There are **no HTTP endpoints** exposed directly. All operations are asynchronous RPC calls.

| Pattern | Method | Payload | Response | Description |
|---------|--------|---------|----------|-------------|
| `media.create` | RPC | `{ file: { buffer, originalname, mimetype } }` | `{ url: string, key: string }` | Upload a file to S3 and return public URL |
| `media.delete` | RPC | `string` (file key) | `{ message: string }` | Delete a file from S3 by key |

### Message Pattern Examples

#### Upload File: `media.create`

**Publishing from Consumer:**
```typescript
// Example from API Gateway or another microservice
this.client.send('media.create', {
  file: {
    buffer: fileBuffer,        // Buffer object from Express multer or similar
    originalname: 'photo.jpg', // Original filename
    mimetype: 'image/jpeg',    // MIME type
  }
}).toPromise();
```

**Response:**
```json
{
  "url": "https://my-commerce-media-bucket.s3.us-east-1.amazonaws.com/550e8400-e29b-41d4-a716-446655440000",
  "key": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Delete File: `media.delete`

**Publishing from Consumer:**
```typescript
this.client.send('media.delete', 'file-key-uuid').toPromise();
```

**Response:**
```json
{
  "message": "Media deleted successfully"
}
```

### Error Responses

All errors are returned as RPC exceptions with HTTP status codes mapped to failure scenarios:

```json
{
  "statusCode": 400,
  "message": "Invalid file or file data missing"
}
```

| Status Code | Scenario | Cause |
|-------------|----------|-------|
| `400` | Bad Request | Missing file data, invalid MIME type |
| `401` | Unauthorized | Invalid AWS credentials |
| `403` | Forbidden | Access denied to S3 bucket |
| `404` | Not Found | S3 bucket doesn't exist, file key not found |
| `408` | Request Timeout | Network timeouts communicating with S3 |
| `500` | Internal Server Error | Unexpected S3 or application errors |

---

## 🔐 Security

### Authentication & Authorization

- **RabbitMQ Security**: Uses AMQP**S** (secure) protocol with connection strings containing credentials
- **AWS Credentials**: IAM credentials are injected via environment variables and never committed to version control
- **S3 Access Control**: Objects uploaded with `public-read` ACL for direct browser access (configurable per deployment needs)

### Input Validation

- **Global Validation Pipe**: Automatically validates and transforms incoming data
  - `whitelist: true` - Strips unknown properties
  - `forbidNonWhitelisted: true` - Rejects unknown properties
  - `transform: true` - Converts primitives to appropriate types
- **Custom Exception Handling**: Validation errors are transformed into RPC exceptions with proper status codes

### Data Protection

- **File Buffer Handling**: Buffers are processed in-memory and not logged
- **UUID-based Keys**: Files are stored with cryptographically random UUIDs, preventing directory traversal
- **MIME Type Validation**: Content-Type is enforced at upload time
- **Error Message Sanitization**: AWS error details are mapped to business-friendly messages

### Compliance Considerations

- **No Sensitive Data Logging**: Application avoids logging file contents or credentials
- **Regional Data Storage**: AWS region can be configured per compliance requirements (GDPR, CCPA, etc.)
- **File Retention**: Consider implementing lifecycle policies in S3 for automatic cleanup

---

## 🧠 Core Logic

### Upload Flow (`media.create`)

```mermaid
graph TD
    A["Consumer sends media.create message"] -->|via RabbitMQ| B["MediaController.create()"]
    B --> C["Extract file from payload:<br/>buffer, originalname, mimetype"]
    C --> D{File data<br/>valid?}
    D -->|No| E["RpcException: 400<br/>Bad Request"]
    D -->|Yes| F["Generate UUID for file key"]
    F --> G["Convert buffer to Buffer object"]
    G --> H["S3: PutObjectCommand"]
    H -->|Success| I["Return public URL + key"]
    H -->|Error| J["handleS3Error()"]
    J --> K["Map S3 error to RPC Exception"]
    E -.->|RpcException| L["Return error to consumer"]
    K -.->|RpcException| L
    I -.->|Success response| L
```

### Delete Flow (`media.delete`)

```mermaid
graph TD
    A["Consumer sends media.delete message<br/>with file key"] -->|via RabbitMQ| B["MediaController.remove()"]
    B --> C["Extract file key from payload"]
    C --> D["S3: DeleteObjectCommand"]
    D -->|Success| E["Return success message"]
    D -->|Error| F["handleS3Error()"]
    F --> G["Map S3 error to RPC Exception"]
    E -.->|Success response| H["Return to consumer"]
    G -.->|RpcException| H
```

### Key Implementation Details

1. **UUID Generation**: Each uploaded file receives a unique UUID-based key for collision-free storage
2. **Buffer Conversion**: File buffers are explicitly converted to Node.js `Buffer` objects for S3 compatibility
3. **Public Read Access**: Objects are stored with `public-read` ACL, generating direct HTTPS URLs
4. **Error Mapping**: S3-specific errors are caught and transformed into business-meaningful RPC exceptions
5. **Async Operations**: All file operations are fully asynchronous using async/await patterns

---

## 🔄 Integrations

### RabbitMQ Integration

- **Transport**: RabbitMQ AMQP protocol with secure AMQPS support
- **Queue Configuration**: Single durable queue configured for message persistence
- **Redundancy**: Queue options include `durable: true` for failure recovery
- **Connectivity**: amqp-connection-manager provides automatic reconnection logic

### AWS S3 Integration

- **SDK Version**: AWS SDK v3 (`@aws-sdk/client-s3`)
- **Authentication**: IAM credentials via environment variables
- **Operations**:
  - `PutObjectCommand`: Upload files with MIME type and public access
  - `DeleteObjectCommand`: Remove files by key
- **Error Handling**: Comprehensive error mapping for all S3 failure scenarios
- **Region Support**: Fully configurable AWS region for global deployment

### Service Discovery

- **No Service Registry**: RabbitMQ connection details are statically configured via environment variables
- **Queue Subscription**: Automatically subscribes to `RABBITMQ_QUEUE` on startup

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests (requires test infrastructure)
npm run test:e2e

# Debug mode
npm run test:debug
```

### Test Configuration

- **Framework**: Jest with TypeScript support (`ts-jest`)
- **Test Files**: Pattern `**/*.spec.ts`
- **Root Directory**: `src/`
- **Coverage Directory**: `coverage/`
- **Environment**: Node.js test environment

### Testing Strategy (Recommendations)

- **Unit Tests**: Test `MediaService` with mocked S3 client
- **Integration Tests**: Test `MediaController` with mocked RabbitMQ
- **Mock Strategy**: Consider using `jest.mock()` for AWS SDK and messaging libraries

---

## 🛠️ Code Quality & Development

### Linting & Formatting

```bash
# Check for lint issues
npm run lint

# Auto-fix lint issues
npm run lint

# Format code with Prettier
npm run format
```

### Build & Compilation

```bash
# Build for production
npm run build

# Output directory: dist/

# Run compiled output
node dist/main
```

### Development Standards

- **TypeScript Strict Mode**: Enabled for type safety
- **ESLint Config**: Uses modern ESLint v9 with Prettier integration
- **Code Style**: Prettier enforces consistent formatting
- **Module System**: CommonJS with path aliases via `tsconfig.json`

---

## 📌 Additional Notes

### Deployment Considerations

1. **Docker Support**: A `dockerfile` is included for containerization
2. **Environment Secrets**: Use secrets management (HashiCorp Vault, AWS Secrets Manager) in production
3. **Health Checks**: Consider implementing a liveness probe endpoint for orchestration
4. **Logging**: Application uses NestJS Logger; consider integrating structured logging (Winston, Pino)
5. **Monitoring**: Integrate APM tools (Datadog, New Relic) for production observability
6. **Scaling**: Stateless design enables horizontal scaling via multiple instances

### Known Limitations & Future Improvements

- **CreateMediaDto**: Currently empty (no validation beyond file buffer)
- **File Size Limits**: No explicit file size validation; consider adding constraints
- **Virus Scanning**: No antivirus scanning integration
- **Metadata Extraction**: Consider extracting EXIF data from images
- **Image Optimization**: No resize/compression operations (could be offloaded to lambda)
- **CDN Integration**: No CloudFront or other CDN optimization configured
- **Retention Policies**: No automatic cleanup of old files (implement S3 lifecycle policies)

### Performance Notes

- **In-Memory Processing**: Files are held in memory during upload (consider streaming for large files)
- **Concurrency**: RabbitMQ prefetch can be tuned based on payload sizes
- **S3 Transfer**: Direct upload to S3 without intermediate processing

### Production Checklist

- [ ] Environment variables configured in secret management system
- [ ] AWS IAM credentials with minimal S3 permissions (principle of least privilege)
- [ ] RabbitMQ configured with persistent queues and connection resilience
- [ ] S3 bucket configured with:
  - [ ] Versioning enabled (optional)
  - [ ] Server-side encryption (SSE)
  - [ ] Lifecycle policies for old object cleanup
  - [ ] CloudFront distribution (optional CDN)
- [ ] Monitoring and alerting configured
- [ ] Logging aggregation setup (CloudWatch, ELK, etc.)
- [ ] Backup strategy for S3 bucket data
- [ ] Load testing performed before production deployment
- [ ] Documentation reviewed with operations team

---

## 📞 Support & Troubleshooting

### Common Issues

**RabbitMQ Connection Fails**
- Verify `RABBITMQ_URL` is accessible from the deployment environment
- Check AMQPS certificate validity if using secure connections
- Confirm firewall rules allow outbound connections on port 5671/5672

**AWS S3 Authentication Errors**
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct
- Confirm IAM credentials have `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` permissions
- Check if credentials are expired or revoked

**File Upload Fails**
- Ensure file buffer is properly formatted
- Verify MIME type is correct
- Check S3 bucket `ACL` permissions for `public-read`

---

## 📝 License

UNLICENSED - All rights reserved

---

**Generated**: April 13, 2026  
**Version**: 0.0.1  
**Repository**: commerce-app-launcher (media-ms)
