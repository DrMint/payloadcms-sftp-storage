About privateKey

Store the private key in .env

```sh
echo "SFTP_PRIVATE_KEY=\"`sed -E 's/$/\\\n/g' /path/to/my_private_key`\"" >> /path/to/.env
```

Then open your .env file and edit the variable into a single line.