module.exports = ({ env }) => ({
    "users-permissions": {
        config: {
            jwtSecret: env('CUSTOM_JWT_SECRET', '720d41ccd82bad03552cdaf3101b0aa3acc4db3acaa3415871babf2f9c010839b68993439c23e6aecb2739b51b935ac649beb6bf29904ebdcaba9645e81abc22')
        }
    },
    "upload": {
        config: {
            provider: 'aws-s3',
            providerOptions: {
                region: env('AWS_REGION'),
                params: {
                    Bucket: env('AWS_BUCKET'),
                },
            },
            actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
            }
        }
    }
});  