module.exports = ({ env }) => ({
    "users-permissions": {
        config: {
            jwtSecret: env('USER_PERMISSIONS_PLUGIN_JWT_SECRET')
        }
    },
    "upload": {
        config: {
            provider: 'aws-s3',
            providerOptions: {
                s3Options: {
                    region: env('AWS_REGION'),
                    params: {
                        Bucket: env('AWS_BUCKET'),
                    }
                }
            },
            actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
            }
        }
    }
});  