# PayloadCMS SFTP Storage Adapter

SFTP adapter for Payload CMS's [plugin-cloud-storage](https://www.npmjs.com/package/@payloadcms/plugin-cloud-storage) plugin

This adapter uses [ssh2-sftp-client](https://www.npmjs.com/package/ssh2-sftp-client) to handle the SSH connection and SFTP operations.

## Usage

Let's say we have a `Videos` collection (which slug is "videos") and we want to store the uploads on a third-party remote storage using SFTP.

At the top of your `payload.config.ts` file, add the following:

```ts
import { sftpAdapter } from "payloadcms-sftp-storage";
```

Then within the `buildConfig` add the following:

```ts
plugins: [
  cloudStorage({
    collections: {
      videos: {
          adapter: sftpAdapter({
          connectOptions: {
              host: "domain.com",
              username: "userName",
              privateKey: process.env.SFTP_PRIVATE_KEY, // See bellow how to add a privatekey in .env file
              passphrase: 'a pass phrase for the private key'

              // Instead of a private key you can also use a password:
              // password: "mypassword",

              // You may set a custom port (default: 22)
              // port: 2207,
          },
          destinationPathRoot: "/absolute/path/to/destination/root/folder",
          publicEndpoint: "https://domain.com",
        }),
        disableLocalStorage: true,
        disablePayloadAccessControl: true,
      },
    },
  }),
],
```

If we upload a video file name "my-video.mp4", the file will be uploaded at destinationPathRoot, in a subfolder named "videos" (because this is the slug of the collection) as a file with the same name as the original "my-video.mp4". In this example, the path of the transfered file will be `/absolute/path/to/destination/root/folder/videos/my-video.mp4`, and its public address will be `https://domain.com/videos/my-video.mp4`

Beware: when deleting an entry, the file will also be deleted on the remote storage. Also, if a file "my-video.mp4" already exists, and we try to upload another file with the same name, the original file will be overwritten.


## About the Private Key

It's a bit tedious to use a private key. You can't use fs within PayloadCMS config file without resorting to some webpack shenanigans. So instead, here's how to store the private key in a .env variable:

Run this command:
```sh
echo "SFTP_PRIVATE_KEY=\"`sed -E 's/$/\\\n/g' /path/to/my_private_key`\"" >> /path/to/.env
```

Then open your .env file and edit the variable into a single line.