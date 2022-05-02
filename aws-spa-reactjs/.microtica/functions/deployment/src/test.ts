
import { handler } from ".";

const fakeContext = {
    getRemainingTimeInMillis: () => 30000
} as any;
const cfnNotification = {
    ResourceProperties: {
        SourceBucket: "mic-dev-mci-349lunl7cj15-sourcesbucket-encsx0agjdgn",
        SourceLocation: "package.zip",
        DestinationBucket: "mic-dev-notification-utbkq5z6-notificationsbucket-18xvssd1pp5o3",
        CdnId: "E2CMW0K63WASQN",
        BackendEndpoint: "https://test.site.com"
    }
} as any;


handler(cfnNotification, fakeContext);