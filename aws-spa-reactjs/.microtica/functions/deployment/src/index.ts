
import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { S3, CloudFront } from "aws-sdk";
import * as https from "https";
import * as url from "url";
import * as unzipper from "unzipper";
import * as mime from "mime-types";

const MS_BEFORE_TIMEOUT = 2000;

interface ZipEntryMetadata {
    path: string;
    type: "Directory" | "File";
    autodrain: () => NodeJS.ReadableStream;
}

interface ZipEntry extends
    Buffer,
    ZipEntryMetadata,
    NodeJS.ReadableStream {
}

export async function handler(event: CloudFormationCustomResourceEvent, context: Context) {
    try {
        startTransaction(event, context);

        if (event.RequestType === "Create" || event.RequestType === "Update") {
            await uploadFiles(event);
            await invalidateCdnCache(event);
        }

        await commitStatus(event, "SUCCESS", {}, "Website package successfully uploaded");
    } catch (error) {
        console.error(error);
        // tslint:disable-next-line:no-console
        console.log("EVENT", JSON.stringify(event));
        await commitStatus(event, "FAILED", {}, error.message);
    }
}

/**
 * Copy the artifact package from the source bucket and upload it unpacked in the destination bucket.
 *
 * @param {CloudFormationCustomResourceEvent} event
 * @returns {Promise<void>}
 */
async function uploadFiles(event: CloudFormationCustomResourceEvent): Promise<void> {
    const s3 = new S3();
    const {
        SourceBucket,
        SourceLocation,
        DestinationBucket
    } = event.ResourceProperties;

    return new Promise((resolve: () => void, reject: (err: Error) => void) => {
        const sourceStream = s3.getObject({
            Bucket: SourceBucket,
            Key: SourceLocation
        }).createReadStream();

        let filesCount: number = 0;
        sourceStream.pipe(unzipper.Parse())
            .on("entry", (entry: ZipEntry) => {
                if (entry.type === "Directory") {
                    entry.autodrain();
                    return;
                }
                filesCount++;
                return s3.upload({
                    Bucket: DestinationBucket,
                    Key: entry.path,
                    Body: entry,
                    ContentType: mime.lookup(entry.path) || null
                }).promise().then(() => {
                    filesCount--;
                    entry.autodrain();
                    if (!filesCount) {
                        resolve();
                    }
                    console.info("Uploaded:", entry.path);
                }).catch((err: Error) => {
                    entry.autodrain();
                    reject(err);
                    console.error("Error upload", entry.path, err);
                });
            })
            .on("error", (err: Error) => reject(err));
    }).then(async () => {
        // replace env.js values
        const path = "env.js"
        await s3.upload({
            Bucket: DestinationBucket,
            Key: path,
            Body: `window.env=${JSON.stringify({
                BACKEND_ENDPOINT: event.ResourceProperties.BackendEndpoint
            })}`,
            ContentType: mime.lookup(path) || null
        }).promise();
    });
}

/**
 * Invalidate CloudFront cache
 *
 * @param {CloudFormationCustomResourceEvent} event
 * @returns {Promise<void>}
 */
async function invalidateCdnCache(event: CloudFormationCustomResourceEvent): Promise<void> {
    const cloudfront = new CloudFront();
    const { CdnId } = event.ResourceProperties;
    console.info("Started CDN cache invalidation. CDN ID:", CdnId);
    await cloudfront.createInvalidation({
        DistributionId: CdnId,
        InvalidationBatch: {
            CallerReference: Date.now().toString(),
            Paths: {
                Quantity: 1,
                Items: ["/*"]
            },
        }
    }).promise();
}

/**
 * Notify CFN for certain status change
 *
 * @param {*} status
 * @param {*} [data={}]
 * @param {string} [reason=""]
 * @returns
 */
function commitStatus(event: CloudFormationCustomResourceEvent, status: string, data = {}, reason: string = "") {
    const responseBody = JSON.stringify({
        Status: status,
        Reason: reason,
        PhysicalResourceId: event.LogicalResourceId,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: data
    });
    console.log("RESPONSE BODY:\n", responseBody);

    return new Promise((resolve, reject) => {
        // const parsedUrl = url.parse(event.ResponseURL);
        const options: https.RequestOptions = {
            method: "PUT",
            headers: {
                "content-type": "",
                "content-length": responseBody.length
            }
        };

        console.log("SENDING RESPONSE...\n");

        const request = https.request(event.ResponseURL, options, response => {
            console.log("STATUS: ", response.statusCode);
            console.log("HEADERS: ", JSON.stringify(response.headers));
            // Tell AWS Lambda that the function execution is done
            resolve();
        });

        request.on("error", error => {
            console.log("sendResponse Error:" + error);
            // Tell AWS Lambda that the function execution is done
            reject(error);
        });

        // write data to request body
        request.write(responseBody);
        request.end();
    });
}

/**
 * Start waiting component to execute all activities in given time set by timeout parameter.
 * If activities does not finish 1 second before the specified timeout,
 * this function notifies CFN for failure
 */
function startTransaction(event: CloudFormationCustomResourceEvent, context: Context) {
    const timeoutHandler = () => {
        console.log("Timeout FAILURE!");
        // Emit event to "sendResponse", then callback with an error from this function
        // tslint:disable-next-line:no-unused-expression
        console.debug("EVENT", JSON.stringify(event));
        commitStatus(event, "FAILED", {}, "Component runtime failed to provision. Timeout.");
    };
    // Set timer so it triggers one second before this function would timeout
    setTimeout(timeoutHandler, context.getRemainingTimeInMillis() - MS_BEFORE_TIMEOUT);
}
