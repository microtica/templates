const path = require("path");
const { NestedComponent } = require("@microtica/component").AwsCloud;

const component = new NestedComponent(
    handleCreate,
    handleUpdate
);

async function handleCreate() {
    // Here specify additional properties which will be provided as input parameters in CFN template during deployment.
    // Properties specified here will be provided during initial resource deployment.
    return {};
}

async function handleUpdate() {
    // Here specify additional properties which will be provided as input parameters in CFN template during deployment.
    // Properties specified here will be provided during resource update deployment.
    return {};
}

module.exports = component;