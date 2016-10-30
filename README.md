# cape

cape (IPA: /keɪp/) is an interface to RADS controllers.

## Configuration

Please specify the configuration in `config.yaml` file in the
project's directory.  For example:

```
cape:
  server:   https://ccu.sh/
  user:     <your-user-id>
  password: <your-password>

cape_ui:
  password: <your-password-to-ui>
```

## Usage

In the project's directory:

```
$ node main.js
```
