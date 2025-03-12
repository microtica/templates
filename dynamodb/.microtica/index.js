const { NestedComponent } = require("@microtica/component").AwsCloud;

const component = new NestedComponent(
    handleCreateOrUpdate,
    handleCreateOrUpdate
);

async function handleCreateOrUpdate() {
    const {
        partitionKey,
        sortKey,
        gsiPartitionKey,
        gsiSortKey,
        MIC_ENVIRONMENT_ID,
        MIC_RESOURCE_ID
    } = await component.getInputParameters();

    const [pk, pkType = "S"] = partitionKey.split(":");
    const [sk, skType = "S"] = sortKey ? sortKey.split(":") : ["", "S"];
    const [gsipk, gsipkType = "S"] = gsiPartitionKey ? gsiPartitionKey.split(":") : ["", "S"];
    const [gsisk, gsiskType = "S"] = gsiSortKey ? gsiSortKey.split(":") : ["", "S"];

    return {
        partitionKey: pk,
        sortKey: sk,
        partitionKeyType: pkType,
        sortKeyType: skType,
        gsiPartitionKey: gsipk,
        gsiPartitionKeyType: gsipkType,
        gsiSortKey: gsisk,
        gsiSortKeyType: gsiskType,
        resourcePrefix: `${MIC_ENVIRONMENT_ID}-${MIC_RESOURCE_ID}`
    };
}


module.exports = component;