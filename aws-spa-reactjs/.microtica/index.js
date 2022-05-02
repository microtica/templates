const path = require("path");
const { NestedComponent } = require("@microtica/component").AwsCloud;

const component = new NestedComponent(
    handleCreateOrUpdate,
    handleCreateOrUpdate
);

async function uploadPackages() {
    return Promise.all([
        component.uploadComponentPackage(path.join(__dirname, "functions/deployment/package.zip")),
        component.uploadComponentPackage(path.join(__dirname, "package.zip"))
    ]);
}

async function handleCreateOrUpdate() {
    const [
        deploymentPackage,
        sitePackage
    ] = await uploadPackages();

    return {
        SourceBucket: sitePackage.s3Bucket,
        SourceLocation: sitePackage.s3Key,
        DeploymentFunctionBucket: deploymentPackage.s3Bucket,
        DeploymentFunctionLocation: deploymentPackage.s3Key
    };
}

module.exports = component;