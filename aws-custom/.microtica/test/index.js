const assert = require("chai").assert;
const AwsCloud = require("@microtica/component").AwsCloud;

const deployTemplate = JSON.stringify(require("../index.json"));

process.env.AWS_REGION = "eu-central-1";

describe("Component tests", () => {
    it("Component deploy action should be valid", async () => {
        try {
            await AwsCloud.Component.validate(deployTemplate)
        } catch (error) {
            assert.isOk(false, error.message);
        }
    });
});