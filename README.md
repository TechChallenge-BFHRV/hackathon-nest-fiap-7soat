# Hackathon FIAP 7SOAT Grupo #49

Application that takes a video input and generates a zip with video thumbnails.

## Event Storm and System Design

Event Storm: https://miro.com/app/board/uXjVLwQ1nKA=/?share_link_id=710039569837

System Design:

![image](./system-design.png)

## Tech Stack

- TypeScript
- Python
- NestJS
- PostgreSQL
- Docker
- Kubernetes
- AWS S3
- AWS SQS
- AWS Lambda
- Azure AKS
- Prometheus

## To run Local Kubernetes Environment

1. Generate a config map based on your local `.env` file with the command `kubectl create configmap my-config --from-env-file=.env` **needs to be updated every time the SESSION TOKEN changes**
2. Run `kubectl apply -f k8s/postgres-deployment.yaml`
3. Run `kubectl apply -f k8s/deployment.yaml`
4. Run `kubectl apply -f k8s/service.yaml`
5. Execute `kubectl get services`
6. Get the **external port** from the hackathon-nest and then in your browser navigate to `http://localhost:ExternalPort/api`

## Module Relationship Structure

```mermaid
graph TD;
    A[AppModule] -->|imports| AuthModule
    A -->|imports| UsersModule
    A -->|imports| VideoModule
    A -->|imports| UploadstatusModule
    A -->|imports| MessagesModule
    A -->|imports| WebhookModule
    A -->|imports| MailerModule
    A -->|imports| MetricsModule

    %% Auth Module Dependencies
    AuthModule -->|generates| AuthGuard
    AuthModule -->|generates| RolesGuard
    AuthModule -->|uses| UsersModule
    AuthModule -->|uses| JwtService
    AuthModule -->|uses| PrismaService


    %% Users Module Dependencies
    UsersModule -->|secured by| AuthGuard
    UsersModule -->|secured by| RolesGuard
    UsersModule -->|uses| PrismaService

    %% Video Module Dependencies
    VideoModule -->|secured by| AuthGuard
    VideoModule -->|secured by| RolesGuard
    VideoModule -->|uses| UploadstatusModule
    VideoModule -->|uses| MessagesModule
    VideoModule -->|uses| S3Client
    VideoModule -->|uses| PrismaService

    %% Upload Status Dependencies
    UploadstatusModule -->|uses| PrismaService

    %% Messages Module Dependencies
    MessagesModule -->|uses| SQSService

    %% Webhook Dependencies
    WebhookModule -->|uses| UploadstatusModule
    WebhookModule -->|uses| MailerModule

    %% Mailer Dependencies
    MailerModule -->|uses| SendGridClient

    %% Metrics Dependencies
    MetricsModule -->|uses| PrometheusClient

    %% Database Communication
    subgraph "Database Layer"
        PrismaService -->|queries| PostgreSQL[(PostgreSQL Database)]
    end
```