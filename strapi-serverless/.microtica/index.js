const path = require("path");
const { NestedComponent } = require("@microtica/component").AwsCloud;

const component = new NestedComponent(
    handleCreate,
    handleUpdate,
    () => { },
    "/tmp/index.json"
);

async function handleCreate() {
    const { MIC_COMPONENT_VERSION, ImageUrl, EnvironmentVariables = "" } = await component.getInputParameters();

    transformTemplate(EnvironmentVariables);

    return {
        ImageUrl: `${ImageUrl}:${MIC_COMPONENT_VERSION}`,
        ShouldMountApiFolder: false,
        AppKeys: `${crypto.randomBytes(32).toString('base64')},${crypto.randomBytes(32).toString('base64')}`,
        ApiTokenSalt: crypto.randomBytes(32).toString('base64'),
        AdminJWTSecret: crypto.randomBytes(32).toString('base64'),
        JWTSecret: crypto.randomBytes(32).toString('base64'),
        TransferTokenSalt: crypto.randomBytes(32).toString('base64'),
        UserPermissionsPluginJWTSecret: crypto.randomBytes(32).toString('base64')
    };
}

async function handleUpdate() {
    const { MIC_COMPONENT_VERSION, ImageUrl, EnvironmentVariables = "" } = await component.getInputParameters();

    transformTemplate(EnvironmentVariables);

    return {
        ImageUrl: `${ImageUrl}:${MIC_COMPONENT_VERSION}`,
        ShouldMountApiFolder: false
    };
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