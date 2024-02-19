import { S3 } from "aws-sdk";
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
import fs from "fs";

const s3 = new S3Client({
    region: 'ap-south-1',
  credentials: {
    //@ts-ignore
    accessKeyId: 'AKIAQ5ZCGUVMDLK3PGF3',
    //@ts-ignore
    secretAccessKey: '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',
  },
})

export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.send(new PutObjectCommand({
        Body: fileContent,
        Bucket: "deployitnow",
        Key: fileName,
    }));
    console.log(response);
}