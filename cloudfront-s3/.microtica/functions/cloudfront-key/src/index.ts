import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import https from "https";
import { pki } from "node-forge";

const MS_BEFORE_TIMEOUT = 2000;
const KEY_BITS = 2048;

export async function handler(event: CloudFormationCustomResourceEvent, context: Context) {
    try {
        startTransaction(event, context);

        const { privateKey, publicKey } = pki.rsa.generateKeyPair(KEY_BITS);

        const privatePem = pki.privateKeyToPem(privateKey);
        const publicPem = pki.publicKeyToPem(publicKey);

        await commitStatus(event, "SUCCESS", {
            publicKey: publicPem,
            privateKeyBase64: Buffer.from(privatePem).toString("base64"),
            publicKeyBase64: Buffer.from(publicPem).toString("base64")
        }, "RSA keys successfully created");
    } catch (error) {
        console.error(error);
        // tslint:disable-next-line:no-console
        console.log("EVENT", JSON.stringify(event));
        await commitStatus(event, "FAILED", {}, error.message);
    }
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
            resolve(undefined);
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

