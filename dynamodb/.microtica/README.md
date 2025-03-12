# AWS DynamoDB Component

Infrastructure component for AWS DynamoDB table setup on AWS Cloud.

## Technology stack
- Microtica component library
- AWS CloudFormation

## Initial Configuration

In order to start developing and delivering new versions of the component there should be some activities which need to be performed before that.

### Developing

Here's a brief intro about what a developer must do in order to start developing
the project further:

```shell
git clone https://github.com/microtica-components/component-aws-dynamodb.git
cd component-aws-dynamodb/
npm install
```

The first command line clones the code on local machine in the current dir. Then goes to the project root folder and install all NodeJS dependency modules.

### Building

> Building script is NOT available for this component.

### Testing

To execute tests and get the tests results and code coverage execute the following command. This will executed the tests available for this component.

```shell
npm test
```

> It's best practice not to push any code before executing the tests and making sure that all tests are passed and code coverage is in defined threshold.

### Deploying / Publishing

This component is available in Microtica under "Microtica Components", you can use if from directly from there or you can freely take and manage the source code of this component on your own Git account. In that case you will have to create new Microtica component under "My Components" section.

## Features

* Server-side encryption (SSE) enabled by default
* Ability to set read/write capacity units
* DynamoDB streams enabled

## Links

* Find out what Microtica is and what it does: [Getting started with Microtica](https://microtica.atlassian.net/servicedesk/customer/portal/1/topic/bec96a57-c909-4279-8712-4fb87238dc56)
* Explore the core building blocks of Microtica - [Core concepts](https://microtica.atlassian.net/servicedesk/customer/portal/1/topic/a5cc9d92-3dc4-436a-98ad-89f0d5f370d0)
* Try it on your own following our guides: [Guides](https://microtica.atlassian.net/servicedesk/customer/portal/1/topic/d57872f7-8a64-4b57-8419-d55a25710d32)

## Future improvements

* Currently this component supports setting partition key only, in the future this component will be enhanced with support for sort keys and Global Secondary Indexes (GSI).

## Licensing

"The code in this project is licensed under MIT license."