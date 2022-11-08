const { ECS, SSM } = require("aws-sdk");
const { ssm } = require("ssm-session");
const WebSocket = require("ws");
const util = require("util");
const response = require('./cfn-response');

const textDecoder = new util.TextDecoder();
const textEncoder = new util.TextEncoder();

const termOptions = {
    rows: 34,
    cols: 197,
};

exports.handler = async function (event, context) {
    if (event.RequestType === 'Delete') {
        return send(event, context, response.SUCCESS, {});
    }

    try {
        const ecs = new ECS();
        const { adminEmail, adminPassword, cluster, serviceName } = event.ResourceProperties;

        const { taskArns } = await ecs.listTasks({ cluster, serviceName }).promise();
        const [taskId] = taskArns?.[0].split('/').reverse();

        console.log("Waiting for services to become stable...");
        
        await ecs.waitFor('servicesStable', { cluster, services: [serviceName] }).promise();
        await ecs.waitFor('tasksRunning', { cluster, tasks: [taskId] }).promise();

        console.log("Services are now stable. Executing medusa user command now...");

        const { tasks } = await ecs.describeTasks({ cluster, tasks: [taskId] }).promise();

        const task = tasks[0];
        const runtimeId = task.containers[0].runtimeId;
        const target = `ecs:${cluster}_${taskId}_${runtimeId}`;

        //Start SSM session
        const { StreamUrl, TokenValue } = await new SSM().startSession({ Target: target }).promise();

        const command = `medusa user --email ${adminEmail} --password ${adminPassword}`;
        await executeCommand(command, StreamUrl, TokenValue);

        await send(event, context, response.SUCCESS, {});
    } catch (error) {
        await send(event, context, response.FAILED, { error });
    }
}

const executeCommand = async (command, streamUrl, token) => {
    const connection = new WebSocket(streamUrl);

    await new Promise((resolve, reject) => {
        connection.onopen = async () => {
            ssm.init(connection, {
                token,
                termOptions: termOptions,
            });

            // Wait for a few second for the initial session to be established
            await delay(5000);

            for (let item of command.split("")) {
                ssm.sendText(connection, textEncoder.encode(item));
            }

            ssm.sendText(connection, textEncoder.encode("\n"));
        };

        connection.onerror = async (error) => {
            console.log(`WebSocket error: ${error}`);
            reject(error);
        };

        connection.onmessage = (event) => {
            var agentMessage = ssm.decode(event.data);
            ssm.sendACK(connection, agentMessage);
            
            if (agentMessage.payloadType === 1) {
                const message = textDecoder.decode(agentMessage.payload);
                process.stdout.write(message);

                // Close the Websocket connection when the command execution is completed
                if (agentMessage.sequenceNumber !== 0 && message.trim().endsWith("#")) {
                    connection.close();
                }
            } else if (agentMessage.payloadType === 17) {
                ssm.sendInitMessage(connection, termOptions);
            }
        };

        connection.onclose = async () => {
            console.log("Websocket closed");
            resolve();
        };
    });
}

const delay = t => new Promise(resolve => setTimeout(resolve, t));

const send = (evt, ctx, status, data) => {
    return new Promise(() => { response.send(evt, ctx, status, data) });
}