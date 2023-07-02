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
    const [dbinitPackage] = await uploadPackages();
    const { MIC_COMPONENT_VERSION, ImageUrl, EnvironmentVariables = "" } = await component.getInputParameters();

    transformTemplate(EnvironmentVariables);

    const cookieSecret = randomstring.generate({ length: 128 });
    const jwtSecret = randomstring.generate({ length: 128 });

    return {
        ImageUrl: `${ImageUrl}:${MIC_COMPONENT_VERSION}`,
        DbInitS3Bucket: dbinitPackage.s3Bucket,
        DbInitS3Key: dbinitPackage.s3Key,
        CookieSecret: cookieSecret,
        JWTSecret: jwtSecret
    };
}

async function handleUpdate() {
    const [dbinitPackage] = await uploadPackages();
    const { MIC_COMPONENT_VERSION, ImageUrl, EnvironmentVariables = "" } = await component.getInputParameters();

    transformTemplate(EnvironmentVariables);

    return {
        ImageUrl: `${ImageUrl}:${MIC_COMPONENT_VERSION}`,
        DbInitS3Bucket: dbinitPackage.s3Bucket,
        DbInitS3Key: dbinitPackage.s3Key
    };
}

async function uploadPackages() {
    return Promise.all([
        component.uploadComponentPackage(path.join(__dirname, "functions/dbinit/package.zip"))
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