const path = require("path");
const randomstring = require("randomstring");
const { NestedComponent } = require("@microtica/component").AwsCloud;

const component = new NestedComponent(
    handleCreate,
    handleUpdate,
    () => { },
    "/tmp/index.json"
);

async function handleCreate() {
    const [
        dbinitPackage,
        deploymentPackage,
        adminPackage
    ] = await uploadPackages();

    const {
        MIC_PROJECT_ID,
        MIC_ENVIRONMENT_ID,
        MIC_RESOURCE_ID,
        MIC_COMPONENT_VERSION,
        ImageUrl,
        EnvironmentVariables = "",
        InstanceType,
        Mode,
        DisableMedusaAdmin
    } = await component.getInputParameters();

    transformTemplate(EnvironmentVariables);

    const cookieSecret = randomstring.generate({ length: 128 });
    const jwtSecret = randomstring.generate({ length: 128 });

    return {
        ImageUrl: `${ImageUrl}:${MIC_COMPONENT_VERSION}`,
        DbInitS3Bucket: dbinitPackage.s3Bucket,
        DbInitS3Key: dbinitPackage.s3Key,
        AdminSourceBucket: adminPackage.s3Bucket,
        AdminSourceLocation: adminPackage.s3Key,
        DeploymentFunctionBucket: deploymentPackage.s3Bucket,
        DeploymentFunctionLocation: deploymentPackage.s3Key,
        CookieSecret: cookieSecret,
        JWTSecret: jwtSecret,
        ProjectId: MIC_PROJECT_ID,
        EnvironmentId: MIC_ENVIRONMENT_ID,
        ResourceId: MIC_RESOURCE_ID,
        MedusaWorkerMode: Mode,
        DisableMedusaAdmin: DisableMedusaAdmin,
        ...mapInstanceType(InstanceType)
    };
}

async function handleUpdate() {
    const [
        dbinitPackage,
        deploymentPackage,
        adminPackage
    ] = await uploadPackages();

    const {
        MIC_PROJECT_ID,
        MIC_ENVIRONMENT_ID,
        MIC_RESOURCE_ID,
        MIC_COMPONENT_VERSION,
        ImageUrl,
        EnvironmentVariables = "",
        InstanceType,
        Mode,
        DisableMedusaAdmin
    } = await component.getInputParameters();

    transformTemplate(EnvironmentVariables);

    return {
        ImageUrl: `${ImageUrl}:${MIC_COMPONENT_VERSION}`,
        DbInitS3Bucket: dbinitPackage.s3Bucket,
        DbInitS3Key: dbinitPackage.s3Key,
        AdminSourceBucket: adminPackage.s3Bucket,
        AdminSourceLocation: adminPackage.s3Key,
        DeploymentFunctionBucket: deploymentPackage.s3Bucket,
        DeploymentFunctionLocation: deploymentPackage.s3Key,
        ProjectId: MIC_PROJECT_ID,
        EnvironmentId: MIC_ENVIRONMENT_ID,
        ResourceId: MIC_RESOURCE_ID,
        MedusaWorkerMode: Mode,
        DisableMedusaAdmin: DisableMedusaAdmin,
        ...mapInstanceType(InstanceType)
    };
}

function mapInstanceType(type) {
    switch (type) {
        case "Small - .25 Core - 512MB Memory":
            return { CPU: "256", Memory: "512" };
        case "Medium - .5 Core - 1GB Memory":
            return { CPU: "512", Memory: "1024" };
        case "Large - 1 Core - 2GB Memory":
            return { CPU: "1024", Memory: "2048" };
        case "XLarge - 2 Core - 4GB Memory":
            return { CPU: "2048", Memory: "4096" };
        case "2XLarge - 4 Core - 8GB Memory":
            return { CPU: "4096", Memory: "8192" };
        case "3XLarge - 4 Core - 16GB Memory":
            return { CPU: "4096", Memory: "16384" };
    }
}

async function uploadPackages() {
    return Promise.all([
        component.uploadComponentPackage(path.join(__dirname, "functions/dbinit/package.zip")),
        component.uploadComponentPackage(path.join(__dirname, "functions/deployment/package.zip")),
        component.uploadComponentPackage(path.join(__dirname, "admin-package.zip"))
    ]);
}

function transformTemplate(envVarsString) {
    const sourcePath = path.join(__dirname, "./index.json");
    const destPath = "/tmp/index.json";

    NestedComponent.transformTemplate(
        sourcePath,
        destPath,
        template => {
            const envVars = envVarsString.split(",").reduce((acc, obj) => {
                const start = obj.indexOf("=");
                const [key] = obj.split("=");
                const value = obj.substring(start + 1);
                if (key && value) {
                    acc[key.trim()] = value.trim();
                }
                return acc;
            }, {});

            const containerEnvironment = Object.keys(envVars).map(key => ({
                Name: key,
                Value: envVars[key]
            }));

            template
                .Resources
                .TaskDefinition
                .Properties
                .ContainerDefinitions[0]
                .Environment
                .push(...containerEnvironment);

            return template;
        }
    );
}

module.exports = component;