const { NestedComponent } = require("@microtica/component").AwsCloud;

const component = new NestedComponent(
    handleCreateOrUpdate,
    handleCreateOrUpdate
);

async function handleCreateOrUpdate() {
    return {};
}


module.exports = component;