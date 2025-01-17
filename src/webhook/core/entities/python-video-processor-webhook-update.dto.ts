import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class VideoProcessorWebhookUpdateDto {
    @ApiProperty({
        description: "Log ID",
        nullable: false,
        required: true,
        type: "number",
        example: 2,
    })
    @IsNumber()
    logId: number;

    @ApiProperty({
        description: "User Email",
        nullable: false,
        required: true,
        type: "string",
        example: "email@example.com",
    })
    @IsString()
    userEmail: string;


    @ApiProperty({
        description: "Upload Status",
        nullable: false,
        required: true,
        type: "string",
        example: "success",
    })
    @IsString()
    status: string;

    @ApiProperty({
        description: "Bucket S3",
        nullable: false,
        required: true,
        type: "string",
        example: "bucket-name",
    })
    @IsString()
    bucketS3: string;

    @ApiProperty({
        description: "Key S3",
        nullable: false,
        required: true,
        type: "string",
        example: "key-s3-name",
    })
    @IsString()
    keyS3: string;
};

