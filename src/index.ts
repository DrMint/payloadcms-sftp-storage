import {
  Adapter,
  GenerateURL,
  HandleDelete,
  HandleUpload,
} from "@payloadcms/plugin-cloud-storage/dist/types";
import path from "path";
import Client from "ssh2-sftp-client";
import type { ConnectOptions } from "ssh2-sftp-client";
import type { Configuration as WebpackConfig } from "webpack";

interface SFTPAdapterConfig {
  connectOptions: ConnectOptions;
  destinationPathRoot: string;
  publicEndpoint: string;
}

export const sftpAdapter =
  ({ connectOptions, destinationPathRoot, publicEndpoint }: SFTPAdapterConfig): Adapter =>
  ({ collection }) => {
    const generateURL: GenerateURL = ({ filename }) =>
      `${publicEndpoint}/${collection.slug}/${filename}`;
    const handleDelete: HandleDelete = async ({ filename }) => {
      const sftp = new Client();
      const connection = await sftp.connect(connectOptions);
      const filePath = `${destinationPathRoot}/${collection.slug}/${filename}`;
      await sftp.delete(filePath);
      connection.end();
    };
    const handleUpload: HandleUpload = async ({ file }) => {
      const sftp = new Client();
      const connection = await sftp.connect(connectOptions);
      const folderPath = `${destinationPathRoot}/${collection.slug}`;
      if (!(await sftp.exists(folderPath))) {
        await sftp.mkdir(folderPath, true);
      }
      const filePath = `${folderPath}/${file.filename}`;
      await sftp.put(file.buffer, filePath);
      connection.end();
    };

    const webpack = (existingWebpackConfig: WebpackConfig): WebpackConfig => {
      const newConfig: WebpackConfig = {
        ...existingWebpackConfig,
        resolve: {
          ...(existingWebpackConfig.resolve || {}),
          alias: {
            ...(existingWebpackConfig.resolve?.alias ? existingWebpackConfig.resolve.alias : {}),
            "payloadcms-sftp-storage": path.resolve(__dirname, "./mock.js"),
          },
          fallback: {
            ...(existingWebpackConfig.resolve?.fallback
              ? existingWebpackConfig.resolve.fallback
              : {}),
            stream: false,
          },
        },
      };

      return newConfig;
    };

    return {
      generateURL,
      handleDelete,
      handleUpload,
      staticHandler: () => {},
      webpack,
    };
  };
