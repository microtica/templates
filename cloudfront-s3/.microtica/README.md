# CDN (Content Delivery Network) component 

Infrastructure setup for hosting Single Page Applications (SPA) and any other kind of public or private static content (e.g. images, PDFs etc.)

When private content restriction is enabled, you should use signed URLs or Cookies to access the private content. Request signing is only available within the same account where this component is provisioned.

This components provisiones:
- CloudFront distribution
- Private S3 Bucket
- Origin Access Identity to enable CloudFront to access the private S3 bucket

> Files stored in the S3 bucket can only be accessed through the CloudFront distribution endpoint.

The component can be configured to use a custom SSL certificate. This certificate should be provisioned in the N. Virginia (us-east-1) region, and it's only required if a custom domain is provided.

## Restrict content access

The component allows you to restrict access to the content served through the CDN. When restricted access is enabled, the only way to access the content is by using a signed URL.

To enable content access restriction, set the component `RestrictAccess` parameter to `true`.

Generate signed URL example:
```
const { CloudFront, SecretsManager } = require("aws-sdk");

const { SecretString: secretString } = await new SecretsManager({
    region: "<AWS REGION>"
}).getSecretValue({
    SecretId: "<'KeysSecret' component output value>"
}).promise();

const { keyId, privateKey } = JSON.parse(secretString);
// Convert private key from base64 format to plain text
const privateKeyPlain = Buffer.from(privateKey, "base64").toString("ascii");

// Generate a signed URL
const signedUrl = new CloudFront.Signer(
    keyId,
    privateKeyPlain
).getSignedUrl({
    url: '<URL of the file stored in S3 e.g. https://d25hfhth3urbcb.cloudfront.net/image.jpg>',
    expires: Math.floor((new Date()).getTime() / 1000) + (60 * 60 * 1) // Current Time in UTC + time in seconds, (60 * 60 * 1 = 1 hour)
});

console.log("Signed URL:", signedUrl);
```

> When using signed URL to upload files, you should set the path to the file that should be uploaded. The path does not have to exist in S3 yet.

## File upload
This component allows you to upload files on S3 through CDN using `PUT` request and sending files as a binary data.

You can store files in a folder structure by using the URL path. For example, if you do a `PUT` request on `/images/image.jpg`, you will get the following folder structure in S3: `images` (folder) -> `image.jpg` (file). Use the same path to download the file.

Upload image file example:
```
curl --location --request PUT 'https://d21hfhth3urhyh.cloudfront.net/images/image.jpg?<signed url query params>' \
--header 'Content-Type: image/jpeg' \
--data-binary '@/Users/user/image.jpg'
```

The above example will upload a file named `image.jpg` on S3 in the the `images` folder.

> The upload feature is only availabe when restrict content access is enabled.
## Image resizing
This component has a built-in functionality for image resizing. Once resized once, then the image is cached and provided directly from the CDN.

To get resized version of an image you should provide the `convert` parameter in query string followed by the `width` or `height` parameter.

If just width or height is provided, the image will keep it's aspect ration. Otherwise, it will crop the image in the center by following the provided width and height.

E.g. `https://example.com/image.jpg?convert=true&width=100`

E.g. `https://example.com/image.jpg?convert=true&width=100&height=200`
## Technology stack
- NodeJS
- Microtica component library
- AWS CloudFormation

## Licensing

The code in this project is licensed under MIT license.