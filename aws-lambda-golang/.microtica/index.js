const path = require("path");
const { NestedComponent } = require("@microtica/component").AwsCloud;

const component = new NestedComponent(
    handleCreateOrUpdate,
    handleCreateOrUpdate
);

async function handleCreateOrUpdate() {
    const [
        ApiLambdaPackage
    ] = await uploadPackages();

    return {
        ApiLambdaBucketName: ApiLambdaPackage.s3Bucket,
        ApiLambdaBucketKey: ApiLambdaPackage.s3Key
    };
}

async function uploadPackages() {
    return Promise.all([
        component.uploadComponentPackage(path.join(__dirname, "api-lambda-package.zip"))
    ]);
}

module.exports = component;