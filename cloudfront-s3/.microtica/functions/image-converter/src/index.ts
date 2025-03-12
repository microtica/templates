import { CloudFrontRequestEvent } from "aws-lambda";
import { S3 } from "aws-sdk";
import path from "path";
import querystring from "querystring";
import sharp from "sharp";

exports.handler = async (event: CloudFrontRequestEvent) => {
    const request = event.Records[0].cf.request;

    const options = querystring.parse(request.querystring);
    const width = parseInt(options.width as string) || undefined;
    const height = parseInt(options.height as string) || undefined;

    // If convert option is disabled or width and height are not provided
    // serve the content from the origin directly
    if (!options.convert || options.convert === "false" || (!width && !height)) {
        return request;
    }

    try {
        const sourceBucketName = request.origin?.s3?.domainName.split(".")[0]!;
        const sourceBucketKey = request.uri.replace(/^\/+/, "");
        const { dir: destDir, name: destFileName, ext: destFileExtension } = path.parse(sourceBucketKey);
        const destBucketKey = `.temp/${destDir}/${destFileName}-${Date.now()}${destFileExtension}`;

        const { image, contentType } = await convertImage(
            sourceBucketName,
            decodeURIComponent(sourceBucketKey),
            width,
            height
        );

        await new S3().upload({
            Bucket: sourceBucketName,
            Key: decodeURIComponent(destBucketKey),
            Body: image,
            ContentType: contentType
        }).promise();

        request.uri = `/${destBucketKey}`;

        return request;
    } catch (err) {
        console.log("Conversion ERROR", JSON.stringify(err));

        // Return the original image
        return request;
    }
};

const convertImage = async (bucketName: string, bucketKey: string, width?: number, height?: number) => {
    const [fileStream, { ContentType: contentType }] = await Promise.all([
        new S3().getObject({ Bucket: bucketName, Key: bucketKey }).createReadStream(),
        new S3().headObject({ Bucket: bucketName, Key: bucketKey }).promise()
    ]);

    const convertedStream = fileStream.pipe(
        sharp().resize({
            width,
            height
        })
    );

    return {
        image: convertedStream,
        contentType
    };
};
