const path = require("path");
const { NestedComponent } = require("@microtica/component").AwsCloud;
const { S3, CloudFormation } = require("aws-sdk");

const component = new NestedComponent(
    handleCreate,
    handleUpdate,
    handleDelete,
    "/tmp/index.json",
);

async function handleCreate() {
    const { RetainContent, MIC_ENVIRONMENT_ID, MIC_RESOURCE_ID, DomainName } = await component.getInputParameters();
    const keyName = `${MIC_ENVIRONMENT_ID}-${MIC_RESOURCE_ID}`;
    const staticDomainName = DomainName.trim() ? `${DomainName.split(".")[0]}-static.${DomainName.split(".").slice(1).join(".")}` : "";

    transformTemplate(RetainContent === "true");

    const s3 = new S3({ region: "us-east-1" });
    const edgeBucketName = keyName.toLowerCase();
    await s3.createBucket({ Bucket: edgeBucketName }).promise();

    const [cloudfrontKeyPackage, imageConverterPackage] = await uploadPackages(edgeBucketName);

    try {
        const originRequestLambdaArn = await createOriginRequestFunction(
            keyName,
            imageConverterPackage
        );
        return {
            KeyName: keyName,
            CloudfrontKeyLambdaBucket: cloudfrontKeyPackage.s3Bucket,
            CloudfrontKeyLambdaBucketKey: cloudfrontKeyPackage.s3Key,
            OriginRequestLambdaArn: originRequestLambdaArn,
            ResourcePrefix: keyName,
            StaticDomainName: staticDomainName
        };
    } catch (error) {
        console.log("Error while provisioning Origin Request Lambda", error);
    }
}

async function handleUpdate() {
    const { RetainContent, MIC_ENVIRONMENT_ID, MIC_RESOURCE_ID, RestrictAccess, DomainName } = await component.getInputParameters();
    const keyName = `${MIC_ENVIRONMENT_ID}-${MIC_RESOURCE_ID}`;
    const staticDomainName = DomainName.trim() ? `${DomainName.split(".")[0]}-static.${DomainName.split(".").slice(1).join(".")}` : "";

    transformTemplate(RetainContent === "true");
    const edgeBucketName = keyName.toLowerCase();
    const [cloudfrontKeyPackage, imageConverterPackage] = await uploadPackages(edgeBucketName);

    try {
        const originRequestLambdaArn = await updateOriginRequestFunction(
            keyName,
            imageConverterPackage,
        );
        return {
            KeyName: keyName,
            CloudfrontKeyLambdaBucket: cloudfrontKeyPackage.s3Bucket,
            CloudfrontKeyLambdaBucketKey: cloudfrontKeyPackage.s3Key,
            OriginRequestLambdaArn: originRequestLambdaArn,
            ResourcePrefix: keyName,
            StaticDomainName: staticDomainName
        };
    } catch (error) {
        console.log("Error while provisioning Origin Request Lambda", error);
        return {
            KeyName: keyName,
            CloudfrontKeyLambdaBucket: cloudfrontKeyPackage.s3Bucket,
            CloudfrontKeyLambdaBucketKey: cloudfrontKeyPackage.s3Key,
            ResourcePrefix: keyName,
            StaticDomainName: staticDomainName
        };
    }
}

async function handleDelete() {
    const { MIC_ENVIRONMENT_ID, MIC_RESOURCE_ID } = await component.getInputParameters();
    const keyName = `${MIC_ENVIRONMENT_ID}-${MIC_RESOURCE_ID}`;

    await deleteOriginRequestFunction(keyName);
}

async function createOriginRequestFunction(name, lambdaPackage) {
    const cfn = new CloudFormation({ region: "us-east-1" });

    await cfn.createStack({
        StackName: name,
        Capabilities: ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"],
        TemplateBody: JSON.stringify(require("./functions/image-converter/cfn.json")),
        Parameters: [{
            ParameterKey: "ImageConverterLambdaBucket",
            ParameterValue: lambdaPackage.s3Bucket
        }, {
            ParameterKey: "ImageConverterLambdaBucketKey",
            ParameterValue: lambdaPackage.s3Key
        }]
    }).promise();

    await cfn.waitFor("stackCreateComplete", { StackName: name }).promise();

    const { Stacks: stacks } = await cfn.describeStacks({ StackName: name }).promise();

    return stacks[0].Outputs.find(o => o.OutputKey === "Version").OutputValue;
}

async function updateOriginRequestFunction(name, lambdaPackage) {
    const cfn = new CloudFormation({ region: "us-east-1" });

    await cfn.updateStack({
        StackName: name,
        Capabilities: ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"],
        TemplateBody: JSON.stringify(require("./functions/image-converter/cfn.json")),
        Parameters: [{
            ParameterKey: "ImageConverterLambdaBucket",
            ParameterValue: lambdaPackage.s3Bucket
        }, {
            ParameterKey: "ImageConverterLambdaBucketKey",
            ParameterValue: lambdaPackage.s3Key
        }]
    }).promise();

    await cfn.waitFor("stackUpdateComplete", { StackName: name }).promise();

    const { Stacks: stacks } = await cfn.describeStacks({ StackName: name }).promise();

    return stacks[0].Outputs.find(o => o.OutputKey === "Version").OutputValue;
}

async function deleteOriginRequestFunction(name) {
    const s3 = new S3({ region: "us-east-1" });
    const cfn = new CloudFormation({ region: "us-east-1" });

    await cfn.deleteStack({ StackName: name }).promise();
    await purgeOutputBucket(name.toLowerCase());
    await s3.deleteBucket({ Bucket: name.toLowerCase() }).promise();
    await cfn.waitFor("stackDeleteComplete", { StackName: name }).promise();
}

async function purgeOutputBucket(bucket) {
    let objects = null;
    try {
        objects = await new S3().listObjects({
            Bucket: bucket
        }).promise();
    } catch (e) {
        if (e.code !== 'NoSuchBucket') {
            throw e;
        }
    }
    if (objects) {
        if (objects.Contents.length === 0) {
            return;
        }
        const keys = objects.Contents.map(c => ({ Key: c.Key }));
        const deleteRequest = {
            Bucket: bucket,
            Delete: {
                Objects: keys
            }
        };
        await new S3().deleteObjects(deleteRequest).promise();
        if (objects.IsTruncated) {
            await purgeOutputBucket(bucket);
        }
    }
}

async function transformTemplate(retainContent) {
    const sourcePath = path.join(__dirname, "./index.json");
    const destPath = "/tmp/index.json";

    NestedComponent.transformTemplate(
        sourcePath,
        destPath,
        template => {
            template.Resources["WebsiteBucket"].DeletionPolicy = retainContent ? "Retain" : "Delete";
            return template;
        }
    );
}

/**
 * Upload Lambda packages
 *
 * @return {*} 
 */
async function uploadPackages(edgeBucketName) {
    return Promise.all([
        component.uploadComponentPackage(path.join(__dirname, "functions/cloudfront-key/package.zip")),
        component.uploadComponentPackage(path.join(__dirname, "functions/image-converter/package.zip"), edgeBucketName, "us-east-1")
    ]);
}

module.exports = component;