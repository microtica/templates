const fs = require("fs");
const assert = require("chai").assert;
const path = require("path");
const AwsCloud = require("@microtica/component").AwsCloud;

const deployTemplate = JSON.stringify(require("../index.json"));

process.env.AWS_REGION = "eu-central-1";

before(async() => {});
after(async() => {
    fs.unlinkSync(path.join(__dirname, "generated.json"));
});

describe("Component tests", () => {
    it("Component deploy action should be valid", async() => {
        await AwsCloud.Component
            .validate(deployTemplate)
            .then(() => assert.isOk(true))
            .catch(err => assert.isOk(false, err.message));
    });

    it("Component deploy action should not be valid", async() => {
        const sourceTempatePath = path.join(__dirname, "../index.json");
        const destTempatePath = path.join(__dirname, "./generated.json");
        AwsCloud.Component.transformTemplate(
            sourceTempatePath,
            destTempatePath,
            (template) => {
                template.Parameters.vpcId.Type = "unsupported_type";
                return template;
            }
        );
        const destTemplate = JSON.stringify(require("./generated.json"));
        return AwsCloud.Component
            .validate(destTemplate)
            .then(() => assert.isOk(false))
            .catch(err => assert.isOk(true));
    });
});