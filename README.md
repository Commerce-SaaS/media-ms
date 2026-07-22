<h1 align="center">🖼️ Media Microservice · <code>media-ms</code></h1>

<p align="center">
  <b>NestJS microservice</b> for media file storage — backed by <b>AWS S3</b><br/>
  and driven entirely by <b>RabbitMQ</b> message-based communication.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS-S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white" />
  <img src="https://img.shields.io/badge/RabbitMQ-RPC-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Transport-RabbitMQ%20only%20(no%20HTTP)-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/Queue-media__queue-8A2BE2?style=flat-square" />
  <img src="https://img.shields.io/badge/Storage-AWS%20S3-569A31?style=flat-square" />
  <img src="https://img.shields.io/badge/Database-none-lightgrey?style=flat-square" />
  <img src="https://img.shields.io/badge/Stateless-yes-2E7D32?style=flat-square" />
</p>

<br/>

## 📌 Purpose

`media-ms` is a **message-driven NestJS microservice** that manages file uploads and deletions for the Commerce App Launcher platform. It receives RPC-style messages through **RabbitMQ**, stores files in **AWS S3**, and returns the generated public URLs.

**Main responsibilities:** 📤 upload media files to S3 · 🗑️ delete stored objects · 🔑 generate unique object keys · 🔄 communicate over RabbitMQ.

| Characteristic | |
|---|:---:|
| RabbitMQ microservice | ✅ |
| AWS S3 integration | ✅ |
| Stateless architecture | ✅ |
| Database dependency | ❌ |
| HTTP REST API | ❌ |
| Event publishing | ❌ |

<br/>

## 🏗️ Architecture

```mermaid
flowchart TB
    OTHER["🌐 Other services"] -. "RabbitMQ RPC · media_queue" .-> MEDIA["🖼️ media-ms<br/><i>NestJS microservice — no HTTP, no DB</i>"]
    MEDIA -. "AWS SDK v3" .-> S3[("☁️ AWS S3<br/>public objects")]
```

<br/>

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **NestJS 11** | Microservice framework |
| **TypeScript 5.7** | Programming language |
| `@nestjs/microservices` | RabbitMQ transport |
| **RabbitMQ** · `amqplib` · `amqp-connection-manager` | RPC broker + connection handling |
| **AWS SDK v3** · `@aws-sdk/client-s3` | Upload / delete operations |
| **Zod** | Environment validation |
| `class-validator` · `class-transformer` | DTO validation / transformation |
| **UUID** | S3 object key generation |
| **Jest** + **ts-jest** | Testing framework |

<br/>

## 📦 Installation & Running

```bash
npm install
```

| Mode | Command |
|---|---|
| 🧑‍💻 Development | `npm run start:dev` |
| 🐞 Debug | `npm run start:debug` |
| 🚀 Production | `npm run build && npm run start:prod` |

> [!IMPORTANT]
> This service does **not** expose REST endpoints. It starts exclusively as a RabbitMQ microservice via `NestFactory.createMicroservice()` — no HTTP controllers, no REST API, no HTTP listener. The `PORT` env var is used only in startup logs (e.g. `Media Microservice is running on port 4004`); it does **not** open a server on that port.

<br/>

## 🐳 Docker

The root `docker-compose.yml` runs `media-ms` from `./media-ms` with mapping `4004:4004` and `PORT=4004`.

> [!WARNING]
> **The application does not actually bind to this port**, and the port values disagree across files:
>
> | Location | Value |
> |---|---|
> | docker-compose | `4004:4004` |
> | `.env.example` | `PORT=4004` |
> | Dockerfile | `EXPOSE 4000` |
>
> The service communicates through RabbitMQ, not TCP/HTTP, so the practical impact is documentation confusion only.

<br/>

## 🧪 Testing

```bash
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
npm run test:debug
```

> [!WARNING]
> **Tests are not implemented yet** — no `*.spec.ts` files, no `test/` directory, no `jest-e2e.json`. The Jest scripts currently exist only as scaffolding.

<br/>

## 🔐 Environment Variables

Validated at startup using `src/config/envs.ts` — **the application exits if required variables are missing.**

| Variable | Required | Description |
|---|:---:|---|
| `NODE_ENV` | ✅ | Runtime environment |
| `PORT` | ❌ | Startup log only |
| `RABBITMQ_URL` | ✅ | RabbitMQ connection URL |
| `RABBITMQ_QUEUE` | ✅ | Queue consumed by the service |
| `AWS_ACCESS_KEY_ID` | ✅ | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | ✅ | AWS secret key |
| `AWS_REGION` | ✅ | AWS region |
| `AWS_BUCKET` | ✅ | Target S3 bucket |

<details>
<summary><b>📄 Example <code>.env</code></b></summary>

<br/>

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

</details>

<br/>

## 📨 RabbitMQ Communication

Transport `Transport.RMQ` — the service consumes RPC-style messages. Patterns live in `src/media/patterns/media_patterns.ts`; handlers in `src/media/media.controller.ts`.

| Pattern | Handler | Payload | Response |
|---|---|---|---|
| `media.create` | `MediaController.create` | File object | `{ url, key }` |
| `media.delete` | `MediaController.remove` | S3 object key | Success message |

<details>
<summary><b>📤 Upload flow — <code>media.create</code></b></summary>

<br/>

`MediaController.create` → `MediaService.upload()`

1. Receives file payload:
   ```ts
   { file: { buffer, mimetype, originalname } }
   ```
2. Validates required data: file buffer + MIME type.
3. Generates a unique key `uuid.extension` (e.g. `7c9f4b12-image.png`).
4. Uploads to S3 with `PutObjectCommand` — `ACL: "public-read"`, `ContentType: mimetype`.
5. Returns:
   ```json
   {
     "url": "https://bucket.s3.region.amazonaws.com/key",
     "key": "uuid.png"
   }
   ```

</details>

<details>
<summary><b>🗑️ Delete flow — <code>media.delete</code></b></summary>

<br/>

`MediaController.remove` → `MediaService.remove()`

1. Receives an S3 object key (e.g. `7c9f4b12-image.png`).
2. Executes `DeleteObjectCommand`.
3. Returns:
   ```json
   { "message": "Media deleted successfully" }
   ```

</details>

<br/>

## 🚨 Error Handling

AWS errors are mapped through `src/helpers/s3-error.helper.ts`:

| AWS Error | Status | Message |
|---|:---:|---|
| `InvalidAccessKeyId` | 401 | Invalid AWS credentials |
| `SignatureDoesNotMatch` | 401 | Invalid AWS credentials |
| `NoSuchBucket` | 404 | Bucket does not exist |
| `NoSuchKey` | 404 | Image does not exist |
| `AccessDenied` | 403 | Access denied |
| `TimeoutError` | 408 | Network error |
| Other errors | 500 | Unexpected S3 error |

<br/>

## ☁️ AWS S3 Integration

Implemented with `@aws-sdk/client-s3` using `PutObjectCommand` and `DeleteObjectCommand`.

| Behavior | |
|---|:---:|
| Public objects | ✅ |
| Manual URL generation | ✅ |
| Signed URLs | ❌ |
| Private bucket flow | ❌ |

Generated URLs follow: `https://<bucket>.s3.<region>.amazonaws.com/<key>`

<br/>

## 🔌 External Dependencies

| Dependency | Usage | Env |
|---|---|---|
| 🐇 **RabbitMQ** | Receiving upload / delete requests (required for startup) | `RABBITMQ_URL`, `RABBITMQ_QUEUE` |
| ☁️ **AWS S3** | File storage / object deletion | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET` |
| 🗄️ **Database** | Not used — no ORM, no client, no migrations, no config | — |

<br/>

## 📁 Project Structure

```
media-ms/
└── src/
    ├── main.ts                     # RabbitMQ bootstrap + ValidationPipe
    ├── app.module.ts               # Root module
    ├── config/
    │   ├── envs.ts                 # Environment validation
    │   ├── services.ts             # RabbitMQ service token
    │   └── transports/
    │       └── rabbitmq.module.ts
    ├── helpers/
    │   └── s3-error.helper.ts
    └── media/
        ├── media.module.ts
        ├── media.controller.ts
        ├── media.service.ts
        ├── dto/
        │   └── create-media.dto.ts
        └── patterns/
            └── media_patterns.ts
```

<br/>

## ⚠️ Current Limitations / TODO

> [!WARNING]
> Tracked openly and worth verifying before production.

- **Port configuration:** `Dockerfile → 4000`, `docker-compose → 4004`, `.env.example → 4004` disagree — and no real listener exists anyway.
- **RabbitMQ queue value:** the deployment queue is injected via `RABBITMQ_QUEUE_MEDIA` from the root environment; the final production value is currently unknown.
- **DTO validation:** `create-media.dto.ts` is empty (`export class CreateMediaDto {}`) and the controller receives `@Payload() data: any` — no automatic payload validation or schema enforcement; only manual checks exist in `MediaService.upload()`.
- **Unused RabbitMQ client:** `src/config/transports/rabbitmq.module.ts` registers `RMQ_SERVICE`, but it's not injected or used and there are no outgoing messages (possible future feature or leftover config).
- **Testing:** no unit, integration, or E2E tests.

<br/>

## ✅ Service Status

| Feature | Status |
|---|:---:|
| RabbitMQ consumer | ✅ Implemented |
| AWS S3 upload | ✅ Implemented |
| AWS S3 delete | ✅ Implemented |
| Public media URLs | ✅ Implemented |
| Database | ❌ Not required |
| HTTP API | ❌ Not exposed |
| Signed URLs | ❌ Not implemented |
| Automated tests | ⚠️ Pending |

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=80&section=footer" />
</p>