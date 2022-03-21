const { NestedComponent } = require("@microtica/component").AwsCloud;

const component = new NestedComponent(
    handleCreateOrUpdate,
    handleCreateOrUpdate
);

async function handleCreateOrUpdate() {
    const { componentVersion, ImageUrl } = await component.getInputParameters();
    return {
        ImageUrl: `${ImageUrl}:${componentVersion}`
    };
}

module.exports = component;