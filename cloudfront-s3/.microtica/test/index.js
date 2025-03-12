const fs = require("fs");
const assert = require("chai").assert;
const path = require("path");
const AwsCloud = require("@microtica/component").AwsCloud;

const deployTemplate = JSON.stringify(require("../index.json"));

process.env.AWS_REGION = "eu-central-1";

after(async () => {
    fs.unlinkSync(path.join(__dirname, "generated.json"));
});

describe("Component tests", () => {
    it("Component deploy action should be valid", async () => {
        try {
            await AwsCloud.Component.validate(deployTemplate)
        } catch (error) {
            assert.isOk(false, error.message);
        }
    });

    it("Component deploy action should not be valid", async () => {
        const sourceTempatePath = path.join(__dirname, "../index.json");
        const destTempatePath = path.join(__dirname, "./generated.json");
        AwsCloud.Component.transformTemplate(
            sourceTempatePath,
            destTempatePath,
            (template) => {
                template.Parameters.DomainName.Type = "unsupported_type";
                return template;
            }
            );
        const destTemplate = JSON.stringify(require("./generated.json"));
        try {
            await AwsCloud.Component.validate(destTemplate)
        } catch (error) {
            return assert.isOk(true);
        }
        assert.isOk(false);
    });
});