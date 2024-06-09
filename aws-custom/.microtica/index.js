const { NestedComponent } = require("@microtica/component").AwsCloud;

const component = new NestedComponent(
    handleCreate,
    handleUpdate
);

async function handleCreate() {
    // Here specify additional properties which will be provided as input parameters in CFN template during deployment.
    // Properties specified here will be provided during initial resource deployment.

    // Get current component input parameters
    // Parameters prefixed with MIC_ are Microtica native parameters
    
    // EXAMPLE:
    // const {
    //     MIC_PROJECT_ID,
    //     MIC_ENVIRONMENT_ID,
    //     MIC_RESOURCE_ID,
    //     MIC_COMPONENT_VERSION
    // } = await component.getInputParameters();

    return {
        // Override or provide new parameters here.
        // Make sure the parameters provided here are defined in the CFN template.
    };
}

async function handleUpdate() {
    // Here specify additional properties which will be provided as input parameters in CFN template during deployment.
    // Properties specified here will be provided during resource update deployment.

    return {};
}

module.exports = component;