const path = require("path");
const crypto = require("crypto");
const { NestedComponent } = require("@microtica/component").AwsCloud;

const component = new NestedComponent(
    handleCreate,
    handleUpdate,
    () => { },
    "/tmp/index.json"
);

async function handleCreate() {
    const {
        MIC_PROJECT_ID,
        MIC_ENVIRONMENT_ID,
        MIC_RESOURCE_ID,
        MIC_COMPONENT_VERSION,
        ImageUrl,
        EnvironmentVariables = "",
        InstanceType
    } = await component.getInputParameters();

    transformTemplate(EnvironmentVariables);

    return {
        ImageUrl: `${ImageUrl}:${MIC_COMPONENT_VERSION}`,
        ShouldMountApiFolder: false,
        AppKeys: `${crypto.randomBytes(32).toString('base64')},${crypto.randomBytes(32).toString('base64')}`,
        ApiTokenSalt: crypto.randomBytes(32).toString('base64'),
        AdminJWTSecret: crypto.randomBytes(32).toString('base64'),
        JWTSecret: crypto.randomBytes(32).toString('base64'),
        TransferTokenSalt: crypto.randomBytes(32).toString('base64'),
        UserPermissionsPluginJWTSecret: crypto.randomBytes(32).toString('base64'),
        ProjectId: MIC_PROJECT_ID,
        EnvironmentId: MIC_ENVIRONMENT_ID,
        ResourceId: MIC_RESOURCE_ID,
        ...mapInstanceType(InstanceType)
    };
}

async function handleUpdate() {
    const {
        MIC_PROJECT_ID,
        MIC_ENVIRONMENT_ID,
        MIC_RESOURCE_ID,
        MIC_COMPONENT_VERSION,
        ImageUrl,
        EnvironmentVariables = "",
        InstanceType
    } = await component.getInputParameters();

    transformTemplate(EnvironmentVariables);

    return {
        ImageUrl: `${ImageUrl}:${MIC_COMPONENT_VERSION}`,
        ShouldMountApiFolder: false,
        ProjectId: MIC_PROJECT_ID,
        EnvironmentId: MIC_ENVIRONMENT_ID,
        ResourceId: MIC_RESOURCE_ID,
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
                .StrapiTaskDefinition
                .Properties
                .ContainerDefinitions[0]
                .Environment["Fn::If"][1]
                .push(...containerEnvironment);

            template
                .Resources
                .StrapiTaskDefinition
                .Properties
                .ContainerDefinitions[0]
                .Environment["Fn::If"][2]
                .push(...containerEnvironment);

            return template;
        }
    );
}

module.exports = component;